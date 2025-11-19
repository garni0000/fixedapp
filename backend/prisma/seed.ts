import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@1234', 10);

  await prisma.user.upsert({
    where: { email: 'admin@fixedpronos.com' },
    update: {},
    create: {
      email: 'admin@fixedpronos.com',
      name: 'FixedPronos Admin',
      passwordHash,
      role: Role.ADMIN,
      referralCode: `ADMIN-${nanoid(8).toUpperCase()}`
    }
  });

  console.log('✅ Seed completed. Admin user: admin@fixedpronos.com / Admin@1234');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

