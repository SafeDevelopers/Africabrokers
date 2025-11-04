import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqContext } from '../tenancy/req-scope.interceptor';

export interface CreateListingDto {
  propertyId: string;
  priceAmount: number;
  priceCurrency: string;
  availabilityStatus?: 'active' | 'pending_review';
  featured?: boolean;
}

export interface SearchListingsDto {
  search?: string;
  propertyType?: 'residential' | 'commercial' | 'land';
  minPrice?: number;
  maxPrice?: number;
  district?: string;
  availability?: 'active' | 'pending_review' | 'suspended';
  page?: number;
  limit?: number;
}

export interface InquiryDto {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async createListing(dto: CreateListingDto) {
    const tenantId = ReqContext.tenantId;
    const userId = ReqContext.userId;

    if (!tenantId || !userId) {
      throw new UnauthorizedException('Authentication required to create listings');
    }

    const broker = await this.prisma.broker.findFirst({
      where: {
        tenantId,
        userId,
        status: {
          in: ['approved', 'submitted'],
        },
      },
    });

    if (!broker) {
      throw new ForbiddenException('Approved broker profile required to create listings');
    }

    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property || property.tenantId !== tenantId) {
      throw new ForbiddenException('Property not found for current tenant');
    }

    const listing = await this.prisma.listing.create({
      data: {
        tenantId,
        propertyId: dto.propertyId,
        brokerId: broker.id,
        priceAmount: dto.priceAmount,
        priceCurrency: dto.priceCurrency,
        availabilityStatus: dto.availabilityStatus || 'pending_review',
        featured: dto.featured || false,
        channels: {
          website: true,
          whatsapp: false,
          telegram: false
        },
        fraudScore: 0,
        publishedAt: dto.availabilityStatus === 'active' ? new Date() : null
      },
      include: {
        property: {
          include: {
            broker: true
          }
        }
      }
    });

    return {
      success: true,
      listing: {
        id: listing.id,
        priceAmount: listing.priceAmount,
        priceCurrency: listing.priceCurrency,
        availabilityStatus: listing.availabilityStatus,
        property: listing.property
      }
    };
  }

  async searchListings(query: SearchListingsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (query.availability) {
      where.availabilityStatus = query.availability;
    }
    
    if (query.minPrice || query.maxPrice) {
      where.priceAmount = {};
      if (query.minPrice) where.priceAmount.gte = query.minPrice;
      if (query.maxPrice) where.priceAmount.lte = query.maxPrice;
    }

    if (query.propertyType) {
      where.property = {
        type: query.propertyType
      };
    }

    const [listings, total] = await Promise.all([
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
                  rating: true
                }
              }
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      this.prisma.listing.count({ where })
    ]);

    type ListingWithRelations = (typeof listings)[number];

    return {
      listings: listings.map((listing: ListingWithRelations) => ({
        id: listing.id,
        priceAmount: listing.priceAmount,
        priceCurrency: listing.priceCurrency,
        availabilityStatus: listing.availabilityStatus,
        featured: listing.featured,
        property: {
          id: listing.property.id,
          type: listing.property.type,
          address: listing.property.address,
          verificationStatus: listing.property.verificationStatus,
          broker: listing.property.broker
        },
        publishedAt: listing.publishedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getListingById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            broker: {
              include: {
                user: {
                  select: {
                    id: true,
                    role: true
                  }
                },
                qrCode: true
              }
            }
          }
        }
      }
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return {
      id: listing.id,
      priceAmount: listing.priceAmount,
      priceCurrency: listing.priceCurrency,
      availabilityStatus: listing.availabilityStatus,
      featured: listing.featured,
      channels: listing.channels,
      property: listing.property,
      publishedAt: listing.publishedAt,
      createdAt: listing.createdAt
    };
  }

  async submitInquiry(listingId: string, dto: InquiryDto) {
    // TODO: Implement email sending
    // For now, just log the inquiry
    console.log('New inquiry received:', {
      listingId,
      inquirer: dto,
      timestamp: new Date()
    });

    return {
      success: true,
      message: 'Your inquiry has been submitted. The property owner will contact you soon.',
      inquiryId: `inquiry-${Date.now()}`
    };
  }
}
