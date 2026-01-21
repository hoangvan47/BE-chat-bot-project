import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MongoDB database...');

  // Hash password for all mock users
  const hashedPassword = await bcrypt.hash('password123', 10);

  try {
    let user1, user2, user3;

    // User 1: admin@test.com
    user1 = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
    if (!user1) {
      user1 = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          username: 'admin',
          password: hashedPassword,
        },
      });
      console.log('✅ Created user: admin@test.com');
    } else {
      console.log('⏭️  User already exists: admin@test.com');
    }

    // User 2: user1@test.com
    user2 = await prisma.user.findUnique({ where: { email: 'user1@test.com' } });
    if (!user2) {
      user2 = await prisma.user.create({
        data: {
          email: 'user1@test.com',
          username: 'user1',
          password: hashedPassword,
        },
      });
      console.log('✅ Created user: user1@test.com');
    } else {
      console.log('⏭️  User already exists: user1@test.com');
    }

    // User 3: user2@test.com
    user3 = await prisma.user.findUnique({ where: { email: 'user2@test.com' } });
    if (!user3) {
      user3 = await prisma.user.create({
        data: {
          email: 'user2@test.com',
          username: 'user2',
          password: hashedPassword,
        },
      });
      console.log('✅ Created user: user2@test.com');
    } else {
      console.log('⏭️  User already exists: user2@test.com');
    }

    // Create sample thread for user1 (only if doesn't exist)
    const existingThread = await prisma.thread.findFirst({
      where: { userId: user2.id },
    });

    if (!existingThread) {
      const thread = await prisma.thread.create({
        data: {
          userId: user2.id,
          title: 'Welcome to Template.net AI Chat',
          latestMessage: 'Hello! How can I help you today?',
        },
      });

      // Create sample messages
      await prisma.message.create({
        data: {
          threadId: thread.id,
          content: 'Hello!',
          sender: 'user',
        },
      });

      await prisma.message.create({
        data: {
          threadId: thread.id,
          content: 'Hello! How can I help you today?',
          sender: 'assistant',
        },
      });

      console.log('✅ Created sample thread:', thread.id);
    } else {
      console.log('⏭️  Sample thread already exists');
    }

    console.log('🎉 Seeding completed!');
    console.log('\n📝 Mock User Credentials:');
    console.log('   Email: user1@test.com');
    console.log('   Password: password123');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
