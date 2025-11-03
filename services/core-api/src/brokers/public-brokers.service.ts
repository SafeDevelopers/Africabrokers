import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface GetPublicBrokersParams {
  limit: number;
  offset: number;
  search?: string;
  city?: string;
  tenantId: string;
}

@Injectable()
export class PublicBrokersService {
  constructor(private prisma: PrismaService) {}

  async getPublicBrokers(params: GetPublicBrokersParams) {
    const { limit, offset, search, city, tenantId } = params;

    // Build base where clause for approved brokers
    const where: any = {
      tenantId,
      role: 'BROKER',
      status: 'ACTIVE',
      // Must have approved broker application
      brokerApplications: {
        some: {
          status: 'APPROVED',
        },
      },
      // Must have approved license
      licenses: {
        some: {
          status: 'APPROVED',
        },
      },
    };

    // For email search, we can query directly
    const emailSearch = search && search.includes('@') ? search : undefined;

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: emailSearch
          ? {
              ...where,
              email: { contains: emailSearch, mode: 'insensitive' },
            }
          : where,
        take: limit * 2, // Fetch more to filter by payload
        skip: offset,
        include: {
          licenses: {
            where: { status: 'APPROVED' },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          brokerApplications: {
            where: { status: 'APPROVED' },
            take: 1,
            orderBy: { submittedAt: 'desc' },
          },
          listings: {
            where: {
              status: 'PUBLISHED',
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Transform to public-safe format and apply filters
    let items = users
      .map((user) => {
        const application = user.brokerApplications[0];
        const license = user.licenses[0];
        const payload = application?.payload as any;

        return {
          id: user.id,
          name: payload?.fullName || user.email.split('@')[0],
          email: user.email,
          phone: payload?.phone,
          company: payload?.companyName || payload?.businessName,
          city: payload?.city,
          location: `${payload?.city || ''}, ${payload?.country || ''}`.trim(),
          licenseNumber: license?.licenseNo || 'N/A',
          verified: true, // All returned brokers are verified
          rating: 0, // TODO: Calculate from reviews
          activeListings: user.listings.length,
          specialties: payload?.specialties || [],
          languages: payload?.languages || [],
          _payload: payload, // Keep for filtering
        };
      })
      .filter((item) => {
        // Apply search filter (if not email search)
        if (search && !emailSearch) {
          const searchLower = search.toLowerCase();
          const matchesSearch =
            item.name.toLowerCase().includes(searchLower) ||
            item.licenseNumber.toLowerCase().includes(searchLower) ||
            item.company?.toLowerCase().includes(searchLower) ||
            item.email.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Apply city filter
        if (city && item.city && item.city.toLowerCase() !== city.toLowerCase()) {
          return false;
        }

        return true;
      })
      .slice(0, limit)
      .map(({ _payload, ...item }) => item); // Remove _payload from final result

    // Recalculate total if filters were applied
    let total = totalCount;
    if (search || city) {
      // If filters were applied, we need to count filtered results
      // For simplicity, return the filtered count
      total = items.length + (offset > 0 ? offset : 0);
    }

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async getPublicBrokerById(brokerId: string, tenantId: string) {
    // Find user with approved broker application and license
    const user = await this.prisma.user.findFirst({
      where: {
        id: brokerId,
        tenantId,
        role: 'BROKER',
        status: 'ACTIVE',
        brokerApplications: {
          some: {
            status: 'APPROVED',
          },
        },
        licenses: {
          some: {
            status: 'APPROVED',
          },
        },
      },
      include: {
        licenses: {
          where: { status: 'APPROVED' },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        brokerApplications: {
          where: { status: 'APPROVED' },
          take: 1,
          orderBy: { submittedAt: 'desc' },
        },
        listings: {
          where: {
            status: 'PUBLISHED',
          },
          select: {
            id: true,
            category: true,
            attrs: true,
            publishedAt: true,
          },
          orderBy: {
            publishedAt: 'desc',
          },
          take: 20,
        },
      },
    });

    if (!user) {
      return null;
    }

    const application = user.brokerApplications[0];
    const license = user.licenses[0];
    const payload = application?.payload as any;

    // Transform listings to public format
    const listings = user.listings.map((listing) => {
      const attrs = listing.attrs as any;
      return {
        id: listing.id,
        title: attrs?.title || `Property ${listing.id}`,
        location: attrs?.location || attrs?.city || '',
        priceLabel: attrs?.priceLabel || `${attrs?.price || 0} ${attrs?.currency || 'ETB'}`,
        imageUrl: attrs?.imageUrl,
      };
    });

    return {
      id: user.id,
      name: payload?.fullName || user.email.split('@')[0],
      email: user.email,
      phone: payload?.phone,
      company: payload?.companyName || payload?.businessName,
      city: payload?.city,
      location: `${payload?.city || ''}, ${payload?.country || ''}`.trim(),
      licenseNumber: license?.licenseNo || 'N/A',
      verified: true,
      rating: 0, // TODO: Calculate from reviews
      bio: payload?.bio || payload?.description || payload?.about,
      specialties: payload?.specialties || [],
      languages: payload?.languages || [],
      stats: {
        activeListings: user.listings.length,
        closedDeals: 0, // TODO: Calculate from closed listings
        responseTime: '< 2 hrs', // TODO: Calculate from inquiry responses
        rating: 0, // TODO: Calculate from reviews
      },
      listings,
    };
  }
}

