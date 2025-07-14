import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@villagesacco.com' },
    update: {},
    create: {
      email: 'admin@villagesacco.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN',
      membershipStatus: 'APPROVED',
      membershipNumber: 'ADMIN001',
      isActive: true,
    },
  })

  // Create a test member
  const memberPassword = await bcrypt.hash('member123', 12)

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: memberPassword,
      role: 'MEMBER',
      membershipStatus: 'APPROVED',
      membershipNumber: 'MEM001',
      isActive: true,
      phone: '+1234567890',
      nationalId: '12345678',
      address: '123 Main Street, Anytown'
    },
  })

  // Create a pending member
  const pendingPassword = await bcrypt.hash('pending123', 12)

  const pendingMember = await prisma.user.upsert({
    where: { email: 'pending@example.com' },
    update: {},
    create: {
      email: 'pending@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: pendingPassword,
      role: 'MEMBER',
      membershipStatus: 'PENDING',
      isActive: true,
      phone: '+1234567891',
      nationalId: '87654321',
      address: '456 Oak Avenue, Somewhere'
    },
  })

  // Create savings account for approved member
  const savingsAccount = await prisma.savingsAccount.create({
    data: {
      userId: member.id,
      accountType: 'REGULAR',
      balance: 500.00,
      interestRate: 0.05,
      totalInterestEarned: 15.25,
      isActive: true
    }
  })

  // Create some sample transactions
  const timestamp = Date.now()
  await prisma.transaction.createMany({
    data: [
      {
        userId: member.id,
        type: 'DEPOSIT',
        amount: 300.00,
        description: 'Initial deposit',
        reference: `DEP-${timestamp}-001`,
        savingsAccountId: savingsAccount.id,
        status: 'COMPLETED',
        processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        userId: member.id,
        type: 'DEPOSIT',
        amount: 200.00,
        description: 'Monthly savings',
        reference: `DEP-${timestamp}-002`,
        savingsAccountId: savingsAccount.id,
        status: 'COMPLETED',
        processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        userId: member.id,
        type: 'INTEREST_PAYMENT',
        amount: 15.25,
        description: 'Monthly interest payment',
        reference: `INT-${timestamp}-001`,
        savingsAccountId: savingsAccount.id,
        status: 'COMPLETED',
        processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin credentials: admin@villagesacco.com / admin123')
  console.log('👤 Member credentials: member@example.com / member123')
  console.log('👤 Pending member: pending@example.com / pending123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
