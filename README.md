# Village SACCO - Blockchain-Powered Cooperative Finance Platform

A modern, comprehensive SACCO (Savings and Credit Cooperative Organization) platform built with Next.js 15, TypeScript, and blockchain integration. This platform enables communities to manage their cooperative finances digitally with transparency, security, and efficiency.

##  Features

### Core Financial Services
- **Savings Management**: Multiple account types (Regular, Fixed Deposit, Emergency)
- **Loan Services**: Application, approval workflow, repayment tracking
- **Transaction Processing**: Deposits, withdrawals, transfers with blockchain logging
- ** Interest Calculation**: Automated interest computation and distribution

### Governance & Administration
- ** Digital Voting**: Proposal creation and democratic decision-making
- ** Member Management**: Registration, approval, status tracking
- ** Admin Dashboard**: Comprehensive oversight and management tools
- ** Analytics**: Financial insights, performance metrics, trend analysis

### Modern Technology Stack
- ** Next.js 15**: Latest React framework with App Router
- ** TypeScript**: Full type safety and enhanced developer experience
- ** Tailwind CSS**: Modern, responsive UI design
- ** Prisma + SQLite**: Type-safe database operations
- ** JWT Authentication**: Secure user authentication and authorization
- ** Blockchain Ready**: Architecture prepared for web3 integration

##  Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VillageSaccoReal
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```
   This will:
   - Install dependencies
   - SUse the set up environment variables
   - Initialize the database
   - Seed with sample data (optional)

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - URL: http://localhost:3000
   - Admin: `admin@villagesacco.com` / `admin123`
   - Member: `member@villagesacco.com` / `member123`

## Current Implementation Status

### Completed Features
- **Authentication System**: Registration, login, JWT-based auth
- **Member Management**: Admin approval workflow, status management
- **Savings Module**: Account creation, deposits, withdrawals, interest calculation  
- **Loan System**: Application submission, admin approval, disbursement, repayment tracking
- **Governance**: Proposal creation, voting system, democratic decision-making
- **Analytics Dashboard**: Financial metrics, performance insights, trend analysis
- **Admin Panel**: Comprehensive management tools, reporting, oversight
- **Responsive UI**: Modern design with Tailwind CSS, mobile-friendly

### Key APIs Implemented
- Member registration and authentication
- Savings account management (deposits, withdrawals)
- Loan application and approval workflow
- Governance proposals and voting
- Admin member management and reporting
- Real-time analytics and financial metrics

### Ready for Integration
- **Blockchain/Web3**: Smart contracts for loans and governance
- **Payment Gateways**: Mobile money, bank transfers
- **Mobile App**: React Native implementation
- **Advanced Analytics**: ML-powered insights
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
