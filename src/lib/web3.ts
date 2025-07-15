import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygonMumbai, hardhat } from 'wagmi/chains'
import { metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors'

// WalletConnect project ID - you should get this from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id'

export const config = createConfig({
  chains: [mainnet, sepolia, polygonMumbai, hardhat],
  connectors: [
    // MetaMask Wallet
    metaMask({
      dappMetadata: {
        name: 'Village SACCO',
        url: 'http://localhost:3000',
        iconUrl: 'https://example.com/icon.png',
      },
    }),

    // Coinbase Wallet
    coinbaseWallet({
      appName: 'Village SACCO',
      appLogoUrl: 'https://example.com/logo.png',
    }),

    // Trust Wallet (via WalletConnect)
    walletConnect({
      projectId,
      metadata: {
        name: 'Village SACCO',
        description: 'Blockchain Financial System for Village Cooperatives',
        url: 'http://localhost:3000',
        icons: ['https://example.com/icon.png']
      },
      // Configure to show Trust Wallet specifically
      showQrModal: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygonMumbai.id]: http(),
    [hardhat.id]: http(),
  },
})

// Contract addresses for different networks - UPDATE THESE AFTER DEPLOYMENT
export const CONTRACT_ADDRESSES: Record<number, string> = {
  [sepolia.id]: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || '0x742d35Cc6634C0532925a3b8D295759aADF1bB21',
  [polygonMumbai.id]: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MUMBAI || '0x742d35Cc6634C0532925a3b8D295759aADF1bB21',
  [hardhat.id]: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_HARDHAT || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
}

// Legacy exports for backwards compatibility
export const CONTRACT_ADDRESS = CONTRACT_ADDRESSES[sepolia.id]

// Use Sepolia as default for now
export const DEFAULT_CHAIN = sepolia

// Contract ABI (complete version from smart contract)
export const VILLAGE_SACCO_ABI = [
  // Member functions
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "termMonths", "type": "uint256" },
      { "internalType": "string", "name": "purpose", "type": "string" }
    ],
    "name": "requestLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "votingPeriod", "type": "uint256" }
    ],
    "name": "createProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "internalType": "bool", "name": "support", "type": "bool" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Admin functions
  {
    "inputs": [
      { "internalType": "address", "name": "memberAddress", "type": "address" },
      { "internalType": "string", "name": "memberId", "type": "string" }
    ],
    "name": "registerMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "name": "approveLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "distributeInterest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }],
    "name": "executeProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "memberAddress", "type": "address" }],
    "name": "deactivateMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "newRate", "type": "uint256" }],
    "name": "setInterestRate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "adminWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // View functions
  {
    "inputs": [{ "internalType": "address", "name": "member", "type": "address" }],
    "name": "getMemberInfo",
    "outputs": [
      { "internalType": "string", "name": "memberId", "type": "string" },
      { "internalType": "uint256", "name": "savingsBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "totalDeposits", "type": "uint256" },
      { "internalType": "uint256", "name": "totalWithdrawals", "type": "uint256" },
      { "internalType": "uint256", "name": "joinedAt", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "name": "getLoanInfo",
    "outputs": [
      { "internalType": "address", "name": "borrower", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "uint256", "name": "termMonths", "type": "uint256" },
      { "internalType": "uint256", "name": "monthlyPayment", "type": "uint256" },
      { "internalType": "uint256", "name": "remainingBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "disbursedAt", "type": "uint256" },
      { "internalType": "uint256", "name": "nextPaymentDue", "type": "uint256" },
      { "internalType": "string", "name": "purpose", "type": "string" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalStats",
    "outputs": [
      { "internalType": "uint256", "name": "totalSavings", "type": "uint256" },
      { "internalType": "uint256", "name": "totalLoans", "type": "uint256" },
      { "internalType": "uint256", "name": "memberCount", "type": "uint256" },
      { "internalType": "uint256", "name": "contractBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "currentInterestRate", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "isAdmin",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "isMember",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextProposalId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "interestRate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "termMonths", "type": "uint256" },
      { "internalType": "string", "name": "purpose", "type": "string" }
    ],
    "name": "requestLoan",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "votingDuration", "type": "uint256" }
    ],
    "name": "createProposal",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "internalType": "bool", "name": "support", "type": "bool" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Admin functions
  {
    "inputs": [
      { "internalType": "address", "name": "memberAddress", "type": "address" },
      { "internalType": "string", "name": "memberId", "type": "string" }
    ],
    "name": "registerMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "name": "approveLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "distributeInterest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View functions
  {
    "inputs": [{ "internalType": "address", "name": "memberAddress", "type": "address" }],
    "name": "getMemberInfo",
    "outputs": [
      { "internalType": "string", "name": "memberId", "type": "string" },
      { "internalType": "uint256", "name": "savingsBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "totalDeposits", "type": "uint256" },
      { "internalType": "uint256", "name": "totalWithdrawals", "type": "uint256" },
      { "internalType": "uint256", "name": "joinedAt", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "loanId", "type": "uint256" }],
    "name": "getLoanInfo",
    "outputs": [
      { "internalType": "address", "name": "borrower", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "uint256", "name": "termMonths", "type": "uint256" },
      { "internalType": "uint256", "name": "monthlyPayment", "type": "uint256" },
      { "internalType": "uint256", "name": "remainingBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "disbursedAt", "type": "uint256" },
      { "internalType": "uint256", "name": "nextPaymentDue", "type": "uint256" },
      { "internalType": "string", "name": "purpose", "type": "string" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalStats",
    "outputs": [
      { "internalType": "uint256", "name": "_totalSavings", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalLoansIssued", "type": "uint256" },
      { "internalType": "uint256", "name": "_memberCount", "type": "uint256" },
      { "internalType": "uint256", "name": "_nextLoanId", "type": "uint256" },
      { "internalType": "uint256", "name": "_nextProposalId", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "isAdmin",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "isMember",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "memberId", "type": "string" }
    ],
    "name": "MemberRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "member", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256" }
    ],
    "name": "SavingsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "borrower", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "purpose", "type": "string" }
    ],
    "name": "LoanRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "voter", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "support", "type": "bool" }
    ],
    "name": "VoteCast",
    "type": "event"
  }
] as const

// Legacy exports for backwards compatibility
export const CONTRACT_ABI = VILLAGE_SACCO_ABI

// Utility functions
export function getContractAddress(chainId: number): string {
  return CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[sepolia.id] || ''
}

export function formatEther(value: bigint): string {
  return (Number(value) / 1e18).toFixed(6)
}

export function parseEther(value: string): bigint {
  return BigInt(Math.floor(parseFloat(value) * 1e18))
}
