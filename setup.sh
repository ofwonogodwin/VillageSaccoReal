#!/bin/bash

# Village SACCO Development Setup Script

echo "🏛️  Setting up Village SACCO Development Environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file..."
    cat > .env << EOL
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (change in production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
EOL
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push

# Check if we should seed the database
echo "🌱 Would you like to seed the database with sample data? (y/n)"
read -r seed_response
if [[ "$seed_response" =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    # Create a simple seed script
    cat > prisma/seed.ts << 'EOL'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await hash('admin123', 12)
  
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
      membershipNumber: 'ADM001',
      isActive: true
    }
  })

  // Create sample member
  const memberPassword = await hash('member123', 12)
  
  const member = await prisma.user.upsert({
    where: { email: 'member@villagesacco.com' },
    update: {},
    create: {
      email: 'member@villagesacco.com',
      firstName: 'John',
      lastName: 'Doe',
      password: memberPassword,
      role: 'MEMBER',
      membershipStatus: 'APPROVED',
      membershipNumber: 'MEM001',
      isActive: true
    }
  })

  // Create savings account for member
  await prisma.savingsAccount.upsert({
    where: { id: 'savings1' },
    update: {},
    create: {
      id: 'savings1',
      userId: member.id,
      accountType: 'REGULAR',
      balance: 1500.00,
      interestRate: 0.05
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin login: admin@villagesacco.com / admin123')
  console.log('👤 Member login: member@villagesacco.com / member123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
EOL

    # Add seed script to package.json
    npm pkg set scripts.seed="tsx prisma/seed.ts"
    npm install tsx --save-dev
    npm run seed
fi

echo ""
echo "🎉 Village SACCO setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "📱 The application will be available at: http://localhost:3000"
echo ""
echo "👤 Default login credentials:"
echo "   Admin: admin@villagesacco.com / admin123"
echo "   Member: member@villagesacco.com / member123"
echo ""
echo "📖 Available features:"
echo "   ✅ User Authentication & Authorization"
echo "   ✅ Member Management (Admin)"
echo "   ✅ Savings Account Management"
echo "   ✅ Loan Application & Management"
echo "   ✅ Governance & Voting System"
echo "   ✅ Analytics Dashboard"
echo "   ✅ Admin Panel with Reporting"
echo ""
echo "🔗 Next steps:"
echo "   • Integrate blockchain/web3 features"
echo "   • Add mobile app support"
echo "   • Implement advanced analytics"
echo "   • Add notification system"
echo ""
