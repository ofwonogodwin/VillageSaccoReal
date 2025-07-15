import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('Creating admin user...')

    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@villagesacco.com' },
      update: {
        role: 'ADMIN',
        membershipStatus: 'APPROVED',
        isActive: true
      },
      create: {
        email: 'admin@villagesacco.com',
        firstName: 'System',
        lastName: 'Administrator',
        password: hashedPassword,
        role: 'ADMIN',
        membershipStatus: 'APPROVED',
        isActive: true,
        membershipNumber: 'ADMIN_001',
        joinedAt: new Date(),
        approvedAt: new Date()
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Password: admin123')
    console.log('🔗 Access: http://localhost:3000/login')
    console.log('🎯 After login, you\'ll be redirected to: /admin/dashboard')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
