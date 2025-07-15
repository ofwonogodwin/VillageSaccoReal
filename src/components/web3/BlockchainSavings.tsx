"use client"

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { VILLAGE_SACCO_ABI, getContractAddress } from '@/lib/web3'
import { toast } from 'sonner'

export function BlockchainSavings() {
  const { address, isConnected, chainId } = useAccount()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const contractAddress = getContractAddress(chainId || 1)

  // Contract read operations
  const { data: memberInfo, refetch: refetchMemberInfo } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: VILLAGE_SACCO_ABI,
    functionName: 'getMemberInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress && isConnected
    }
  })

  const { data: isMember } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: VILLAGE_SACCO_ABI,
    functionName: 'isMember',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress && isConnected
    }
  })

  // Contract write operations
  const {
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositPending
  } = useWriteContract()

  const {
    writeContract: withdraw,
    data: withdrawHash,
    isPending: isWithdrawPending
  } = useWriteContract()

  // Wait for transaction receipts
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  })

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  })

  // Handle successful transactions
  useEffect(() => {
    if (isDepositSuccess) {
      toast.success('Deposit successful!')
      setDepositAmount('')
      refetchMemberInfo()
    }
  }, [isDepositSuccess, refetchMemberInfo])

  useEffect(() => {
    if (isWithdrawSuccess) {
      toast.success('Withdrawal successful!')
      setWithdrawAmount('')
      refetchMemberInfo()
    }
  }, [isWithdrawSuccess, refetchMemberInfo])

  const handleDeposit = async () => {
    if (!depositAmount || !contractAddress) return

    try {
      const amount = parseEther(depositAmount)
      deposit({
        address: contractAddress as `0x${string}`,
        abi: VILLAGE_SACCO_ABI,
        functionName: 'deposit',
        value: amount,
      })
    } catch (error) {
      console.error('Deposit error:', error)
      toast.error('Failed to process deposit')
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || !contractAddress) return

    try {
      const amount = parseEther(withdrawAmount)
      withdraw({
        address: contractAddress as `0x${string}`,
        abi: VILLAGE_SACCO_ABI,
        functionName: 'withdraw',
        args: [amount],
      })
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast.error('Failed to process withdrawal')
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">
            Connect your wallet to access blockchain savings features
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!contractAddress) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Not Available</h3>
          <p className="text-gray-600">
            Smart contract is not deployed on this network
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!isMember) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Not a Registered Member</h3>
          <p className="text-gray-600">
            You need to be registered as a member to use blockchain savings
          </p>
          <Badge variant="secondary" className="mt-2">
            Contact admin for registration
          </Badge>
        </CardContent>
      </Card>
    )
  }

  const savingsBalance = memberInfo ? formatEther(memberInfo[1]) : '0'
  const totalDeposits = memberInfo ? formatEther(memberInfo[2]) : '0'
  const totalWithdrawals = memberInfo ? formatEther(memberInfo[3]) : '0'
  const isActive = memberInfo ? memberInfo[5] : false

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            <span>Blockchain Savings Account</span>
            {isActive && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Your savings stored on the blockchain with smart contract security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-200">
                {parseFloat(savingsBalance).toFixed(4)} ETH
              </div>
              <div className="text-sm text-blue-700">Current Balance</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-200">
                {parseFloat(totalDeposits).toFixed(4)} ETH
              </div>
              <div className="text-sm text-green-700">Total Deposits</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-200">
                {parseFloat(totalWithdrawals).toFixed(4)} ETH
              </div>
              <div className="text-sm text-purple-700">Total Withdrawals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit and Withdraw */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Deposit */}
        <Card className="hover:border-green-300 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-green-600 transition-transform duration-200 group-hover:scale-110" />
              <span>Deposit</span>
            </CardTitle>
            <CardDescription>
              Add funds to your blockchain savings account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="depositAmount" className="text-sm font-medium">Amount (ETH)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  step="0.001"
                  placeholder="0.0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  disabled={isDepositPending || isDepositConfirming}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleDeposit}
                disabled={!depositAmount || isDepositPending || isDepositConfirming}
                className="w-full"
              >
                {isDepositPending || isDepositConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isDepositPending ? 'Confirming...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Deposit
                  </>
                )}
              </Button>
              {depositHash && (
                <div className="text-xs text-gray-600">
                  Transaction: {depositHash.slice(0, 10)}...{depositHash.slice(-8)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Withdraw */}
        <Card className="hover:border-red-300 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Minus className="h-5 w-5 text-red-600 transition-transform duration-200 group-hover:scale-110" />
              <span>Withdraw</span>
            </CardTitle>
            <CardDescription>
              Withdraw funds from your blockchain savings account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdrawAmount" className="text-sm font-medium">Amount (ETH)</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  step="0.001"
                  placeholder="0.0"
                  max={savingsBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={isWithdrawPending || isWithdrawConfirming}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500 mt-1 transition-colors duration-200 hover:text-gray-700">
                  Available: {parseFloat(savingsBalance).toFixed(4)} ETH
                </div>
              </div>
              <Button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || isWithdrawPending || isWithdrawConfirming || parseFloat(withdrawAmount) > parseFloat(savingsBalance)}
                variant="outline"
                className="w-full"
              >
                {isWithdrawPending || isWithdrawConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isWithdrawPending ? 'Confirming...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    Withdraw
                  </>
                )}
              </Button>
              {withdrawHash && (
                <div className="text-xs text-gray-600">
                  Transaction: {withdrawHash.slice(0, 10)}...{withdrawHash.slice(-8)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Status */}
      {(isDepositConfirming || isWithdrawConfirming) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">
                Transaction is being processed on the blockchain...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Blockchain Benefits</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg transition-all duration-300 hover:bg-green-50 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2 transition-transform duration-200 group-hover:scale-110 group-hover:text-green-700" />
              <div className="font-medium group-hover:text-green-800">Transparent</div>
              <div className="text-sm text-gray-600 group-hover:text-green-600">All transactions on-chain</div>
            </div>
            <div className="text-center p-3 rounded-lg transition-all duration-300 hover:bg-green-50 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2 transition-transform duration-200 group-hover:scale-110 group-hover:text-green-700" />
              <div className="font-medium group-hover:text-green-800">Secure</div>
              <div className="text-sm text-gray-600 group-hover:text-green-600">Smart contract protected</div>
            </div>
            <div className="text-center p-3 rounded-lg transition-all duration-300 hover:bg-green-50 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2 transition-transform duration-200 group-hover:scale-110 group-hover:text-green-700" />
              <div className="font-medium group-hover:text-green-800">Decentralized</div>
              <div className="text-sm text-gray-600 group-hover:text-green-600">No single point of failure</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
