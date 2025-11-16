import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@gmail.com';
    const password = 'adminadmin';
    const firstName = 'Admin';
    const lastName = 'User';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`❌ User with email ${email} already exists`);
      console.log('   Updating to ADMIN role...');

      // Update existing user to ADMIN
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          password: await bcrypt.hash(password, 10),
          emailVerified: true,
        },
      });

      console.log('✅ User updated to ADMIN');
      console.log(`📧 Email: ${updated.email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`👤 Role: ${updated.role}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true,
      },
    });

    console.log('\n🎉 Admin user created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: ${admin.role}`);
    console.log(`🆔 ID: ${admin.id}\n`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
