import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createInquiry(data: {
    tenantId: string;
    listingId: string;
    brokerUserId: string;
    fullName: string;
    email: string;
    phone?: string;
    message: string;
    source: string;
  }) {
    return this.prisma.inquiry.create({
      data: {
        tenantId: data.tenantId,
        listingId: data.listingId,
        brokerUserId: data.brokerUserId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source,
        status: 'NEW',
      },
    });
  }

  async getInquiriesByBroker(
    brokerUserId: string,
    tenantId: string,
    filters: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      brokerUserId,
      tenantId,
    };

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          listing: {
            select: {
              id: true,
              property: {
                select: {
                  id: true,
                  address: true,
                  propertyType: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInquiryById(id: string, brokerUserId: string, tenantId: string) {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: {
        id,
        brokerUserId,
        tenantId,
      },
      include: {
        listing: {
          select: {
            id: true,
            property: {
              select: {
                id: true,
                address: true,
                propertyType: true,
              },
            },
          },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    // Set lastBrokerView if it's the first view
    if (!inquiry.lastBrokerView) {
      await this.prisma.inquiry.update({
        where: { id },
        data: { lastBrokerView: new Date() },
      });
      inquiry.lastBrokerView = new Date();
    }

    return inquiry;
  }

  async updateInquiry(
    id: string,
    brokerUserId: string,
    tenantId: string,
    data: {
      status?: string;
      brokerNotes?: string;
    },
  ) {
    // Verify inquiry exists and belongs to broker
    const inquiry = await this.prisma.inquiry.findFirst({
      where: {
        id,
        brokerUserId,
        tenantId,
      },
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    // Validate status transitions
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        NEW: ['READ', 'ARCHIVED'],
        READ: ['NEW', 'ARCHIVED'],
        ARCHIVED: ['NEW', 'READ'],
      };

      const allowed = validTransitions[inquiry.status] || [];
      if (!allowed.includes(data.status)) {
        throw new BadRequestException(
          `Cannot transition from ${inquiry.status} to ${data.status}`,
        );
      }
    }

    return this.prisma.inquiry.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.brokerNotes !== undefined && { brokerNotes: data.brokerNotes }),
      },
    });
  }

  async getListingWithBroker(listingId: string, tenantId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        id: listingId,
        tenantId,
      },
      include: {
        broker: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (!listing.broker) {
      throw new BadRequestException('Listing does not have an assigned broker');
    }

    if (!listing.broker.user) {
      throw new BadRequestException('Broker does not have a user account');
    }

    return {
      listingId: listing.id,
      brokerUserId: listing.broker.user.id,
      broker: {
        id: listing.broker.user.id,
        email: listing.broker.user.email,
        // User model doesn't have name field, use email as placeholder
        name: listing.broker.user.email.split('@')[0] || 'Broker',
        phone: null, // Phone not available in User model
      },
    };
  }
}

