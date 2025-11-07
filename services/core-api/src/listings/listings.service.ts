import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqContext } from '../tenancy/req-scope.interceptor';
import { PlatformSettingsHelper } from '../super-platform-settings/platform-settings.helper';

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
  constructor(
    private prisma: PrismaService,
    private settingsHelper: PlatformSettingsHelper,
  ) {}

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

    // Check if prePublish review is required according to settings (with tenant overrides)
    const settings = await this.settingsHelper.getEffectiveSettings();
    const prePublishRequired = settings.marketplace?.review?.prePublish ?? true;
    
    // If prePublish is required and user tries to publish directly, force pending_review
    let finalStatus: 'active' | 'pending_review' = dto.availabilityStatus || 'pending_review';
    if (prePublishRequired && dto.availabilityStatus === 'active') {
      finalStatus = 'pending_review';
    } else if (!prePublishRequired && !dto.availabilityStatus) {
      finalStatus = 'active';
    }

    const listing = await this.prisma.listing.create({
      data: {
        tenantId,
        propertyId: dto.propertyId,
        brokerId: broker.id,
        priceAmount: dto.priceAmount,
        priceCurrency: dto.priceCurrency,
        availabilityStatus: finalStatus,
        featured: dto.featured || false,
        channels: {
          website: true,
          whatsapp: false,
          telegram: false
        },
        fraudScore: 0,
        publishedAt: finalStatus === 'active' ? new Date() : null
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
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Simplified query - just get all listings for now
      // Note: PrismaService extension automatically injects tenantId
      const where: any = {};

      // Only show active or pending_review listings by default
      if (query.availability) {
        where.availabilityStatus = query.availability;
      } else {
        // Default to active status only for now to avoid enum issues
        where.availabilityStatus = 'active';
      }

      if (query.minPrice || query.maxPrice) {
        where.priceAmount = {};
        if (query.minPrice) {
          where.priceAmount.gte = Number(query.minPrice);
        }
        if (query.maxPrice) {
          where.priceAmount.lte = Number(query.maxPrice);
        }
      }

      if (query.propertyType) {
        where.property = {
          type: query.propertyType
        };
      }

      console.log('Search listings query:', JSON.stringify(where, null, 2));

      let listings: any[] = [];
      let total = 0;

      try {
        const result = await this.prisma.listing.findMany({
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
            { publishedAt: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        });

        listings = result || [];
        
        // Filter by active/pending_review if no availability filter specified
        if (!query.availability) {
          listings = listings.filter((l: any) => 
            l.availabilityStatus === 'active' || l.availabilityStatus === 'pending_review'
          );
        }

        total = await this.prisma.listing.count({ where });
      } catch (prismaError: any) {
        console.error('Prisma query error:', prismaError);
        console.error('Error details:', {
          message: prismaError?.message,
          code: prismaError?.code,
          meta: prismaError?.meta,
          stack: prismaError?.stack
        });
        // Return empty results instead of throwing
        return {
          listings: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        };
      }

      return {
        listings: listings.map((listing: any) => ({
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
          },
          publishedAt: listing.publishedAt,
          attrs: listing.attrs
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      console.error('Error in searchListings:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      // Return empty response instead of throwing
      return {
        listings: [],
        pagination: {
          page: query.page || 1,
          limit: query.limit || 20,
          total: 0,
          totalPages: 0
        }
      };
    }
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
      attrs: listing.attrs,
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
