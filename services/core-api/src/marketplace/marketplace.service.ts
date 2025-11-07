import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GetListingsParams {
  tenantId: string;
  q?: string;
  limit: number;
  offset: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async getListings(params: GetListingsParams) {
    const { tenantId, q, limit, offset, sortField, sortDirection } = params;

    try {
      // Build where clause
      const where: any = {
        tenantId,
        // Only return active or pending_review listings
        availabilityStatus: {
          in: ['active', 'pending_review'],
        },
      };

      // Add search query if provided
      if (q) {
        where.OR = [
          {
            property: {
              address: {
                contains: q,
                mode: 'insensitive',
              },
            },
          },
          {
            attrs: {
              path: ['title'],
              string_contains: q,
            },
          },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortField === 'createdAt') {
        orderBy.createdAt = sortDirection;
      } else if (sortField === 'priceAmount') {
        orderBy.priceAmount = sortDirection;
      } else if (sortField === 'publishedAt') {
        orderBy.publishedAt = sortDirection;
      } else {
        // Default to createdAt:desc
        orderBy.createdAt = 'desc';
      }

      // Fetch listings and count
      const [listings, count] = await Promise.all([
        this.prisma.listing.findMany({
          where,
          include: {
            property: {
              include: {
                broker: {
                  select: {
                    id: true,
                    licenseNumber: true,
                    status: true,
                    rating: true,
                  },
                },
              },
            },
          },
          orderBy,
          take: limit,
          skip: offset,
        }),
        this.prisma.listing.count({ where }),
      ]);

      // Transform listings to response format
      const items = listings.map((listing) => ({
        id: listing.id,
        priceAmount: listing.priceAmount,
        priceCurrency: listing.priceCurrency,
        availabilityStatus: listing.availabilityStatus,
        featured: listing.featured,
        property: {
          id: listing.property?.id,
          type: listing.property?.type,
          address: listing.property?.address,
          verificationStatus: listing.property?.verificationStatus,
          broker: listing.property?.broker
            ? {
                id: listing.property.broker.id,
                licenseNumber: listing.property.broker.licenseNumber,
                status: listing.property.broker.status,
                rating: listing.property.broker.rating,
              }
            : null,
        },
        publishedAt: listing.publishedAt?.toISOString() || null,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        attrs: listing.attrs,
      }));

      return {
        items,
        count,
      };
    } catch (error) {
      // Always return 200 with empty items on error
      console.error('Error fetching marketplace listings:', error);
      return {
        items: [],
        count: 0,
      };
    }
  }
}

