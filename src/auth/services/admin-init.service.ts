import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminInitService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    try {
      // Check if any admin exists
      const adminExists = await this.prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });

      if (adminExists) {
        console.log('✅ Admin user already exists');
        return;
      }

      // Create default admin
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);

      const admin = await this.prisma.user.create({
        data: {
          email: 'admin@broker.com',
          firstName: 'Super',
          lastName: 'Admin',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
        },
      });

      console.log('\n🎉 Default admin user created!');
      console.log('📧 Email: admin@broker.com');
      console.log('🔑 Password: Admin@123456');
      console.log('⚠️  CHANGE THIS PASSWORD IMMEDIATELY!\n');
    } catch (error) {
      console.error('❌ Error creating default admin:', error.message);
    }
  }
}
