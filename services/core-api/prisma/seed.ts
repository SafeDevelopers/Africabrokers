import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create tenant with brand configuration
  const tenant = await prisma.tenant.upsert({
    where: { key: 'et-addis' },
    update: {},
    create: {
      slug: 'et-addis',
      key: 'et-addis',
      name: 'AfriBrok Ethiopia - Addis Ababa',
      country: 'Ethiopia',
      locales: { default: 'en', supported: ['en', 'am'] } as any,
      policies: {
        dataRetention: '90 days',
        privacyPolicy: 'https://afribrok.com/privacy',
      } as any,
      brandConfig: {
        primaryColor: '#1f2937',
        secondaryColor: '#4f46e5',
      } as any,
      currency: 'ETB',
    },
  });

  console.log('✅ Tenant ready:', tenant.name);

  // Agent office
  const agentOffice = await prisma.agentOffice.upsert({
    where: { id: `${tenant.id}-addis-office` },
    update: {
      city: 'Addis Ababa',
      isCapital: true,
    },
    create: {
      id: `${tenant.id}-addis-office`,
      tenantId: tenant.id,
      city: 'Addis Ababa',
      isCapital: true,
    },
  });

  console.log('✅ Agent office ready:', agentOffice.city);

  // Super Admin User (for platform-wide access)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@afribrok.com' },
    update: {},
    create: {
      tenantId: tenant.id, // SUPER_ADMIN still needs a tenantId (required field)
      email: 'admin@afribrok.com',
      authProviderId: 'keycloak|super-admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Super Admin ready:', superAdmin.email);

  // Users
  const tenantAdmin = await prisma.user.upsert({
    where: { email: 'admin@afribrok.et' },
    update: {},
    create: {
      tenantId: tenant.id,
      agentOfficeId: agentOffice.id,
      email: 'admin@afribrok.et',
      authProviderId: 'auth0|tenant-admin',
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@afribrok.et' },
    update: {},
    create: {
      tenantId: tenant.id,
      agentOfficeId: agentOffice.id,
      email: 'agent@afribrok.et',
      authProviderId: 'auth0|agent-001',
      role: 'AGENT',
      status: 'ACTIVE',
    },
  });

  const brokerUser = await prisma.user.upsert({
    where: { email: 'broker@afribrok.et' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'broker@afribrok.et',
      authProviderId: 'auth0|broker-001',
      role: 'BROKER',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Users ready');

  // Broker
  const broker = await prisma.broker.upsert({
    where: {
      tenantId_licenseNumber: {
        tenantId: tenant.id,
        licenseNumber: 'ETH-AA-0001',
      },
    },
    update: {
      status: 'approved',
      approvedAt: new Date(),
    },
    create: {
      tenantId: tenant.id,
      userId: brokerUser.id,
      licenseNumber: 'ETH-AA-0001',
      licenseDocs: {
        businessName: 'Tadesse Real Estate',
        licenseUrl: 'https://example.com/license.pdf',
      },
      businessDocs: {
        tinCertificate: 'https://example.com/tin.pdf',
      },
      status: 'approved',
      rating: 4.8,
      strikeCount: 0,
      submittedAt: new Date(),
      approvedAt: new Date(),
    },
  });

  // Property + Listing
  const property = await prisma.property.create({
    data: {
      tenantId: tenant.id,
      brokerId: broker.id,
      type: 'residential',
      address: {
        street: 'Bole Road',
        city: 'Addis Ababa',
        country: 'Ethiopia',
      },
      verificationStatus: 'verified',
    },
  });

  const listing = await prisma.listing.create({
    data: {
      tenantId: tenant.id,
      propertyId: property.id,
      brokerId: broker.id,
      priceAmount: new Prisma.Decimal(25000),
      priceCurrency: 'ETB',
      availabilityStatus: 'active',
      channels: {
        website: true,
        whatsapp: false,
      },
      attrs: {
        title: 'Modern 3BR Apartment in Bole',
        location: 'Bole, Addis Ababa',
        priceLabel: 'ETB 25,000 / month',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-0ef3c08b6651',
      },
      featured: true,
      fraudScore: 0,
      publishedAt: new Date(),
    },
  });

  // QR code and link to broker
  const qrCode = await prisma.qrCode.create({
    data: {
      tenantId: tenant.id,
      code: 'AFR-QR-0001',
      status: 'active',
      qrSvgUrl: '/qr/AFR-QR-0001.svg',
      metadata: {
        brokerId: broker.id,
      },
    },
  });

  await prisma.broker.update({
    where: { id: broker.id },
    data: {
      qrCodeId: qrCode.id,
    },
  });

  // KYC review trail
  await prisma.kycReview.create({
    data: {
      tenantId: tenant.id,
      brokerId: broker.id,
      reviewerId: tenantAdmin.id,
      decision: 'approved',
      notes: 'Seed approval for demo broker',
      decidedAt: new Date(),
    },
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('\nSeed summary:');
  console.log(`  - Tenant: ${tenant.key} (${tenant.name})`);
  console.log(`  - Super Admin: ${superAdmin.email} (role: ${superAdmin.role})`);
  console.log(`  - Tenant Admin: ${tenantAdmin.email}`);
  console.log(`  - Broker: ${broker.licenseNumber}`);
  console.log(`  - Listing: ${listing.id}`);
  console.log(`  - QR Code: ${qrCode.code}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
