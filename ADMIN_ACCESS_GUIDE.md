# 🔐 Admin Panel Access Guide

## How to Access the Admin Panel

### Method 1: Create Admin User via Database

1. **Option A: Via Prisma Studio (Easiest)**
   ```bash
   npx prisma studio
   ```
   - Navigate to `User` table
   - Create a new user or edit existing user
   - Set `role` to `ADMIN`
   - Set `membershipStatus` to `APPROVED`
   - Set `isActive` to `true`

2. **Option B: Via Direct Database Query**
   ```bash
   npx prisma db seed
   ```
   Or manually via SQLite browser:
   ```sql
   INSERT INTO User (
     id, email, firstName, lastName, password, role, membershipStatus, isActive
   ) VALUES (
     'admin_001', 'admin@villagesacco.com', 'System', 'Administrator', 
     '$2b$10$hash_here', 'ADMIN', 'APPROVED', 1
   );
   ```

### Method 2: Login as Admin

1. **Navigate to Login Page**: `http://localhost:3000/login`
2. **Use Admin Credentials**: 
   - Email: `admin@villagesacco.com` 
   - Password: `admin123` (or whatever you set)
3. **Automatic Redirect**: System will redirect to `/admin/dashboard`

### Method 3: Direct Access (If Logged In)

- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **Member Management**: `http://localhost:3000/admin/members`

## 🎯 Admin Panel Features

### 1. **Main Dashboard** (`/admin/dashboard`)
- **System Statistics**: Total members, savings, loans
- **Pending Approvals**: Members waiting for approval
- **Recent Transactions**: Latest financial activities
- **Blockchain Admin Tools**: Smart contract management

### 2. **Member Management** (`/admin/members`)
- **Approve/Reject** new member registrations
- **Activate/Deactivate** existing members
- **View member details** and financial history
- **Manage member status** and roles

### 3. **Blockchain Administration**
- **Register Members** on smart contract
- **Remove Members** from blockchain
- **Withdraw Funds** from contract
- **Update Interest Rates**
- **Distribute Interest** to members
- **Pause/Unpause** contract operations

### 4. **Loan Management**
- **Review Loan Applications**
- **Approve/Reject Loans**
- **Track Active Loans**
- **Manage Repayments**

### 5. **Financial Oversight**
- **Transaction Monitoring**
- **Savings Account Management**
- **Interest Distribution**
- **Financial Reports**

## 🚀 Quick Setup Script

Create an admin user quickly:

```bash
# Run this in your project directory
npx prisma studio
```

Or use this seed script (create `prisma/admin-seed.ts`):

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@villagesacco.com' },
    update: {},
    create: {
      email: 'admin@villagesacco.com',
      firstName: 'System',
      lastName: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      membershipStatus: 'APPROVED',
      isActive: true,
      membershipNumber: 'ADMIN_001'
    }
  })
  
  console.log('Admin user created:', admin.email)
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run it:
```bash
npx tsx prisma/admin-seed.ts
```

## 🔧 For Your Client

### Client Instructions:

1. **Access Admin Panel**:
   - URL: `https://your-domain.com/admin/dashboard`
   - Login: Use admin credentials provided

2. **First-Time Setup**:
   - Connect MetaMask wallet as admin
   - Deploy or connect to smart contract
   - Set up initial system parameters

3. **Daily Operations**:
   - Review and approve new member registrations
   - Monitor savings and loan activities
   - Approve loan applications
   - Distribute interest to members

4. **Member Onboarding Process**:
   - User registers via `/register`
   - Admin reviews in `/admin/dashboard`
   - Admin approves member
   - Admin registers member on blockchain
   - Member can now use full system

### Smart Contract Admin Rights

The admin wallet (first deployer) has these blockchain permissions:
- Register new members on-chain
- Remove members from contract
- Set interest rates
- Distribute interest
- Pause/unpause contract
- Admin withdraw (emergency)

## 🔐 Security Notes

1. **Admin Wallet**: Use a secure wallet for admin operations
2. **Private Keys**: Never share admin private keys
3. **Access Control**: Regularly review admin user access
4. **Backup**: Keep secure backups of admin credentials
5. **Monitoring**: Monitor admin actions via blockchain explorer

## 📱 Mobile Admin Access

The admin panel is responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones
- MetaMask mobile browser

## 🆘 Troubleshooting

### "Access Denied" Error
- Check user role is set to `ADMIN` in database
- Verify user is active and approved
- Clear browser cache and re-login

### Blockchain Functions Not Working
- Ensure admin wallet is connected
- Check wallet has Base Sepolia ETH
- Verify contract is deployed and address is correct
- Check admin has ADMIN_ROLE on contract

### Database Issues
- Run `npx prisma generate`
- Run `npx prisma db push`
- Check database file permissions

## 🎯 Ready for Client Handover

Your admin panel is fully functional with:
- ✅ User authentication and authorization
- ✅ Member management system
- ✅ Blockchain integration
- ✅ Financial oversight tools
- ✅ Responsive design
- ✅ Security measures
- ✅ Complete admin workflow

**Next Steps**: 
1. Create admin user
2. Deploy smart contract
3. Test full admin workflow
4. Hand over to client with credentials
