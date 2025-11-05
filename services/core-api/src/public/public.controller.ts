import { Controller, Post, Body, Request, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateAgentApplicationDto {
  organizationName!: string;
  organizationType?: string;
  orgType?: string;
  orgTypeNotes?: string;
  registrationNumber!: string;
  country!: string;
  city!: string;
  address!: string;
  primaryContact!: {
    name: string;
    email: string;
    phone: string;
  };
  secondaryContact?: {
    name: string;
    email: string;
    phone: string;
  };
  teamSize!: string;
  coverageAreas!: string[];
  previousExperience!: string;
  complianceStandards?: string[];
}

export class CreateSellLeadDto {
  name!: string;
  phone!: string;
  email?: string;
  location?: string;
  category?: string;
  notes?: string;
}

@Controller('public')
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /v1/public/agents/applications
   * Create a new agent application
   */
  @Post('agents/applications')
  async createAgentApplication(
    @Body() dto: CreateAgentApplicationDto,
    @Request() req: any,
  ) {
    const tenantId = req.tenantId || req.headers['x-tenant'] || req.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Extract orgType and orgTypeNotes from the DTO
    // Support both organizationType (for backward compatibility) and orgType
    const orgType = dto.orgType || dto.organizationType;
    const orgTypeNotes = dto.orgTypeNotes;

    // Store the full payload in JSON
    const payload = {
      organizationName: dto.organizationName,
      organizationType: dto.organizationType,
      registrationNumber: dto.registrationNumber,
      country: dto.country,
      city: dto.city,
      address: dto.address,
      primaryContact: dto.primaryContact,
      secondaryContact: dto.secondaryContact,
      teamSize: dto.teamSize,
      coverageAreas: dto.coverageAreas,
      previousExperience: dto.previousExperience,
      complianceStandards: dto.complianceStandards || [],
    };

    // Create or find a user for this application
    // For agent applications, we might need to create a temporary user
    // For now, we'll create a placeholder user or use the email from primary contact
    let user = await this.prisma.user.findFirst({
      where: {
        email: dto.primaryContact.email,
        tenantId,
      },
    });

    if (!user) {
      // Create a temporary user for the application
      user = await this.prisma.user.create({
        data: {
          tenantId,
          email: dto.primaryContact.email,
          role: 'AGENT', // Default role for agent applications
          status: 'ACTIVE',
        },
      });
    }

    // Create the application
    const application = await this.prisma.brokerApplication.create({
      data: {
        tenantId,
        userId: user.id,
        payload,
        orgType: orgType || null,
        orgTypeNotes: orgTypeNotes || null,
        status: 'SUBMITTED',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    return {
      id: application.id,
      status: application.status,
      submittedAt: application.submittedAt.toISOString(),
      message: 'Application submitted successfully',
    };
  }

  /**
   * POST /v1/public/leads/sell
   * Create a lead from the sell page
   */
  @Post('leads/sell')
  async createSellLead(
    @Body() dto: CreateSellLeadDto,
    @Request() req: any,
  ) {
    const tenantId = req.tenantId || req.headers['x-tenant'] || req.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Validate required fields
    if (!dto.name || !dto.phone) {
      throw new BadRequestException('Name and phone are required');
    }

    // Store the full payload in JSON
    const payload = {
      name: dto.name,
      phone: dto.phone,
      email: dto.email || null,
      location: dto.location || null,
      category: dto.category || null,
      notes: dto.notes || null,
    };

    // Create the lead
    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        source: 'SELL_PAGE',
        payloadJson: payload,
        status: 'NEW',
      },
      include: {
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    // TODO: Emit webhook if configured
    // This would typically be done via a webhook service or event emitter
    // For now, we'll just log it
    console.log('Lead created:', {
      id: lead.id,
      tenantId: lead.tenantId,
      source: lead.source,
      payload: payload,
    });

    return {
      id: lead.id,
      status: lead.status,
      createdAt: lead.createdAt.toISOString(),
      message: 'Lead submitted successfully',
    };
  }
}

