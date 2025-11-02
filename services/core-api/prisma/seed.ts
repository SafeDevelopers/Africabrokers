import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Ethiopia tenant
  const ethiopiaTenant = await prisma.tenant.upsert({
    where: { key: 'ethiopia-addis' },
    update: {},
    create: {
      key: 'ethiopia-addis',
      name: 'AfriBrok Ethiopia - Addis Ababa',
      domain: 'addis.afribrok.com',
      brandConfig: {
        logo: '/logos/ethiopia.svg',
        primaryColor: '#184C8C',
        secondaryColor: '#0F9D58',
        accentColor: '#F9A825'
      },
      locales: ['en', 'am'],
      currency: 'ETB',
      paymentConfig: {
        telebirr: {
          enabled: true,
          sandboxMode: true
        }
      },
      dataResidency: 'ethiopia',
      active: true
    }
  });

  console.log('✅ Created Ethiopia tenant:', ethiopiaTenant.name);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { authProviderId: 'admin@afribrok.com' },
    update: {},
    create: {
      tenantId: ethiopiaTenant.id,
      authProviderId: 'admin@afribrok.com',
      role: 'admin',
      emailHash: 'admin_email_hash',
      kycStatus: 'verified',
      mfaEnabled: true
    }
  });

  console.log('✅ Created admin user');

  // Create regulator user
  const regulatorUser = await prisma.user.upsert({
    where: { authProviderId: 'regulator@gov.et' },
    update: {},
    create: {
      tenantId: ethiopiaTenant.id,
      authProviderId: 'regulator@gov.et',
      role: 'regulator',
      emailHash: 'regulator_email_hash',
      kycStatus: 'verified',
      mfaEnabled: true
    }
  });

  console.log('✅ Created regulator user');

  // Create sample certified broker user
  const brokerUser = await prisma.user.upsert({
    where: { authProviderId: 'broker@example.com' },
    update: {},
    create: {
      tenantId: ethiopiaTenant.id,
      authProviderId: 'broker@example.com',
      role: 'certified_broker',
      emailHash: 'broker_email_hash',
      phoneHash: 'broker_phone_hash',
      nationalIdHash: 'broker_id_hash',
      kycStatus: 'verified',
      mfaEnabled: false
    }
  });

  // Create sample broker record
  const broker = await prisma.broker.upsert({
    where: { id: 'sample-broker-id' },
    update: {},
    create: {
      id: 'sample-broker-id',
      tenantId: ethiopiaTenant.id,
      userId: brokerUser.id,
      licenseNumber: 'ETH-BR-2024-001',
      licenseDocs: {
        licenseUrl: '/uploads/license-sample.pdf',
        idUrl: '/uploads/id-sample.pdf',
        selfieUrl: '/uploads/selfie-sample.jpg'
      },
      businessDocs: {
        businessLicense: '/uploads/business-sample.pdf'
      },
      status: 'approved',
      rating: 4.8,
      strikeCount: 0,
      submittedAt: new Date('2024-01-15'),
      approvedAt: new Date('2024-01-20')
    }
  });

  console.log('✅ Created sample broker');

  // Create QR code for the broker
  const qrCode = await prisma.qrCode.create({
    data: {
      tenantId: ethiopiaTenant.id,
      brokerId: broker.id,
      qrSvgUrl: '/qr-codes/sample-broker-qr.svg',
      status: 'active'
    }
  });

  // Update broker with QR code ID
  await prisma.broker.update({
    where: { id: broker.id },
    data: { qrCodeId: qrCode.id }
  });

  console.log('✅ Created QR code for broker');

  // Create sample property
  const property = await prisma.property.create({
    data: {
      tenantId: ethiopiaTenant.id,
      ownerUserId: brokerUser.id,
      brokerId: broker.id,
      type: 'residential',
      address: {
        street: 'Bole Road',
        subcity: 'Bole',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        country: 'Ethiopia',
        postalCode: '1000'
      },
      ownershipProofUrl: '/uploads/ownership-sample.pdf',
      verificationStatus: 'verified'
    }
  });

  console.log('✅ Created sample property');

  // Create sample listing
  const listing = await prisma.listing.create({
    data: {
      tenantId: ethiopiaTenant.id,
      propertyId: property.id,
      priceAmount: 25000,
      priceCurrency: 'ETB',
      availabilityStatus: 'active',
      channels: {
        website: true,
        whatsapp: true,
        telegram: false
      },
      featured: true,
      fraudScore: 0.1,
      publishedAt: new Date()
    }
  });

  console.log('✅ Created sample listing');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });