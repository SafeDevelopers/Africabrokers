import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create et-addis tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'et-addis' },
    update: {},
    create: {
      slug: 'et-addis',
      name: 'AfriBrok Ethiopia - Addis Ababa',
      country: 'Ethiopia',
      locales: ['en', 'am'],
      policies: {
        dataRetention: '90 days',
        privacyPolicy: 'https://afribrok.com/privacy',
      },
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create Addis Ababa agent office (capital)
  // First check if it exists, then create or update
  const existingOffice = await prisma.agentOffice.findFirst({
    where: {
      tenantId: tenant.id,
      city: 'Addis Ababa',
    },
  });

  const agentOffice = existingOffice
    ? await prisma.agentOffice.update({
        where: { id: existingOffice.id },
        data: { isCapital: true },
      })
    : await prisma.agentOffice.create({
        data: {
          tenantId: tenant.id,
          city: 'Addis Ababa',
          isCapital: true,
        },
      });

  console.log('✅ Created agent office:', agentOffice.city);

  // Create TENANT_ADMIN user
  const tenantAdmin = await prisma.user.upsert({
    where: { email: 'admin@afribrok.et' },
    update: {},
    create: {
      tenantId: tenant.id,
      agentOfficeId: agentOffice.id,
      email: 'admin@afribrok.et',
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created TENANT_ADMIN user:', tenantAdmin.email);

  // Create AGENT user
  const agent = await prisma.user.upsert({
    where: { email: 'agent@afribrok.et' },
    update: {},
    create: {
      tenantId: tenant.id,
      agentOfficeId: agentOffice.id,
      email: 'agent@afribrok.et',
      role: 'AGENT',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created AGENT user:', agent.email);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\nSeeded data:');
  console.log(`  - Tenant: ${tenant.slug} (${tenant.name})`);
  console.log(`  - Agent Office: ${agentOffice.city} (capital: ${agentOffice.isCapital})`);
  console.log(`  - Tenant Admin: ${tenantAdmin.email}`);
  console.log(`  - Agent: ${agent.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
