export interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  walletAddress?: string
  membershipStatus: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'TERMINATED'
  membershipNumber?: string
  role: 'MEMBER' | 'ADMIN' | 'TREASURER' | 'CHAIRPERSON'
  joinedAt: Date
  isActive: boolean
}

export interface SavingsAccount {
  id: string
  userId: string
  accountType: 'REGULAR' | 'FIXED_DEPOSIT' | 'EMERGENCY'
  balance: number
  interestRate: number
  totalInterestEarned: number
  isActive: boolean
}

export interface Loan {
  id: string
  userId: string
  amount: number
  interestRate: number
  termMonths: number
  purpose: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'COMPLETED' | 'DEFAULTED'
  monthlyPayment: number
  remainingBalance: number
  nextPaymentDue?: Date
}

export interface Transaction {
  id: string
  userId: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'INTEREST_PAYMENT' | 'FEE_PAYMENT' | 'TRANSFER'
  amount: number
  description?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  txHash?: string
  createdAt: Date
}

export interface Proposal {
  id: string
  creatorId: string
  title: string
  description: string
  category: 'POLICY_CHANGE' | 'FINANCIAL_DECISION' | 'MEMBERSHIP_ISSUE' | 'GENERAL'
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  votingStartsAt: Date
  votingEndsAt: Date
  votesFor: number
  votesAgainst: number
  totalVotes: number
}
