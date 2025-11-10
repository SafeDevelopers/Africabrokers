import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async findMany(tenant: string, q: { offset?: number; limit?: number; sort?: string; q?: string }) {
    const take = Number(q?.limit ?? 12);
    const skip = Number(q?.offset ?? 0);
    const order = (q?.sort === 'createdAt:asc') ? 'asc' : 'desc';

    // Build where clause
    const where: any = {
      tenantId: tenant,
      availabilityStatus: 'active', // Only return active listings (PUBLISHED status)
    };

    // Add search query if provided
    if (q?.q) {
      where.OR = [
        {
          property: {
            address: {
              path: ['street'],
              string_contains: q.q,
            },
          },
        },
        {
          attrs: {
            path: ['title'],
            string_contains: q.q,
          },
        },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {
      createdAt: order,
    };

    const listings = await this.prisma.listing.findMany({
      where,
      take,
      skip,
      orderBy,
      select: {
        id: true,
        priceAmount: true,
        createdAt: true,
        attrs: true,
        property: {
          select: {
            id: true,
            type: true,
            address: true,
            broker: {
              select: {
                id: true,
                licenseNumber: true,
                status: true,
                rating: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform listings to response format with broker public fields
    const items = listings.map((listing: any) => {
      const attrs = listing.attrs as any || {};
      const address = listing.property?.address as any || {};
      
      return {
        id: listing.id,
        title: attrs.title || null,
        price: listing.priceAmount,
        address: address.street || address.address || null,
        city: address.city || null,
        coverImageUrl: attrs.coverImageUrl || attrs.images?.[0] || null,
        createdAt: listing.createdAt.toISOString(),
        bedrooms: attrs.bedrooms || null,
        bathrooms: attrs.bathrooms || null,
        area: attrs.area || attrs.squareFeet || null,
        broker: listing.property?.broker ? {
          id: listing.property.broker.id,
          name: listing.property.broker.user?.email?.split('@')[0] || null, // Derive from email
          company: null, // Not available in schema
          licenseNo: listing.property.broker.licenseNumber,
          verified: listing.property.broker.status === 'approved',
          phone: null, // Not available in schema
          email: listing.property.broker.user?.email || null,
          avatarUrl: null, // Not available in schema
        } : null,
      };
    });

    const count = await this.prisma.listing.count({ where });

    return { items, count };
  }

  async findOne(tenant: string, id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        id,
        tenantId: tenant,
        availabilityStatus: 'active', // Only return active listings (PUBLISHED status)
      },
      select: {
        id: true,
        priceAmount: true,
        createdAt: true,
        attrs: true,
        property: {
          select: {
            id: true,
            type: true,
            address: true,
            latitude: true,
            longitude: true,
            broker: {
              select: {
                id: true,
                licenseNumber: true,
                status: true,
                rating: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const attrs = listing.attrs as any || {};
    const address = listing.property?.address as any || {};

    return {
      id: listing.id,
      title: attrs.title || null,
      description: attrs.description || null,
      price: listing.priceAmount,
      address: address.street || address.address || null,
      city: address.city || null,
      geoLat: listing.property?.latitude || null,
      geoLng: listing.property?.longitude || null,
      images: attrs.images || [],
      amenities: attrs.amenities || [],
      createdAt: listing.createdAt.toISOString(),
      broker: listing.property?.broker ? {
        id: listing.property.broker.id,
        name: listing.property.broker.user?.email?.split('@')[0] || null, // Derive from email
        company: null, // Not available in schema
        licenseNo: listing.property.broker.licenseNumber,
        verified: listing.property.broker.status === 'approved',
        phone: null, // Not available in schema
        email: listing.property.broker.user?.email || null,
        avatarUrl: null, // Not available in schema
      } : null,
    };
  }
}

