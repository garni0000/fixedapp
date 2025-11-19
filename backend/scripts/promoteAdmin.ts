import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide the user email: npm run promote-admin -- user@example.com');
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌ No user found with email ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  });

  console.log(`✅ User ${email} is now ADMIN`);
}

main()
  .catch((error) => {
    console.error('❌ Failed to promote user', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

