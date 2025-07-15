"use client"

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock
} from 'lucide-react'
import { VILLAGE_SACCO_ABI, getContractAddress } from '@/lib/web3'
import { toast } from 'sonner'

export function BlockchainLoans() {
  const { address, isConnected, chainId } = useAccount()
  const [loanAmount, setLoanAmount] = useState('')
  const [termMonths, setTermMonths] = useState('12')
  const [purpose, setPurpose] = useState('')
  const [repaymentAmount, setRepaymentAmount] = useState('')
  const [selectedLoanId, setSelectedLoanId] = useState('')

  const contractAddress = getContractAddress(chainId || 1)

  // Contract read operations
  const { data: memberInfo } = useReadContract({
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
    writeContract: requestLoan,
    data: requestHash,
    isPending: isRequestPending
  } = useWriteContract()

  const {
    writeContract: repayLoan,
    data: repayHash,
    isPending: isRepayPending
  } = useWriteContract()

  // Wait for transaction receipts
  const { isLoading: isRequestConfirming, isSuccess: isRequestSuccess } = useWaitForTransactionReceipt({
    hash: requestHash,
  })

  const { isLoading: isRepayConfirming, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({
    hash: repayHash,
  })

  // Handle successful transactions
  useEffect(() => {
    if (isRequestSuccess) {
      toast.success('Loan request submitted successfully!')
      setLoanAmount('')
      setPurpose('')
      setTermMonths('12')
    }
  }, [isRequestSuccess])

  useEffect(() => {
    if (isRepaySuccess) {
      toast.success('Loan payment successful!')
      setRepaymentAmount('')
      setSelectedLoanId('')
    }
  }, [isRepaySuccess])

  const handleLoanRequest = async () => {
    if (!loanAmount || !purpose || !contractAddress) return

    try {
      const amount = parseEther(loanAmount)
      const term = parseInt(termMonths)

      requestLoan({
        address: contractAddress as `0x${string}`,
        abi: VILLAGE_SACCO_ABI,
        functionName: 'requestLoan',
        args: [amount, BigInt(term), purpose],
      })
    } catch (error) {
      console.error('Loan request error:', error)
      toast.error('Failed to submit loan request')
    }
  }

  const handleRepayment = async () => {
    if (!repaymentAmount || !selectedLoanId || !contractAddress) return

    try {
      const amount = parseEther(repaymentAmount)
      const loanId = parseInt(selectedLoanId)

      repayLoan({
        address: contractAddress as `0x${string}`,
        abi: VILLAGE_SACCO_ABI,
        functionName: 'repayLoan',
        args: [BigInt(loanId)],
        value: amount,
      })
    } catch (error) {
      console.error('Repayment error:', error)
      toast.error('Failed to process repayment')
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">
            Connect your wallet to access blockchain loan features
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
            You need to be registered as a member to access loan features
          </p>
          <Badge variant="secondary" className="mt-2">
            Contact admin for registration
          </Badge>
        </CardContent>
      </Card>
    )
  }

  const savingsBalance = memberInfo ? formatEther(memberInfo[1]) : '0'
  const isActive = memberInfo ? memberInfo[5] : false
  const minimumSavings = 0.1 // 0.1 ETH minimum savings requirement
  const hasMinimumSavings = parseFloat(savingsBalance) >= minimumSavings

  return (
    <div className="space-y-6">
      {/* Loan Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Blockchain Loan Services</span>
            {isActive && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active Member
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Decentralized lending with smart contract automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${hasMinimumSavings ? 'bg-green-100' : 'bg-red-100'}`}>
                {hasMinimumSavings ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div>
                <div className="font-medium">Savings Requirement</div>
                <div className="text-sm text-gray-600">
                  {parseFloat(savingsBalance).toFixed(4)} ETH / {minimumSavings} ETH minimum
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                {isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div>
                <div className="font-medium">Member Status</div>
                <div className="text-sm text-gray-600">
                  {isActive ? 'Active Member' : 'Inactive Member'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-green-600" />
            <span>Request Loan</span>
          </CardTitle>
          <CardDescription>
            Submit a new loan request to the smart contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loanAmount">Loan Amount (ETH)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  disabled={isRequestPending || isRequestConfirming || !hasMinimumSavings}
                />
              </div>
              <div>
                <Label htmlFor="termMonths">Term (Months)</Label>
                <Input
                  id="termMonths"
                  type="number"
                  min="1"
                  max="60"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  disabled={isRequestPending || isRequestConfirming || !hasMinimumSavings}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of this loan..."
                value={purpose}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPurpose(e.target.value)}
                disabled={isRequestPending || isRequestConfirming || !hasMinimumSavings}
              />
            </div>

            {loanAmount && termMonths && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">Loan Preview</div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>Amount: {loanAmount} ETH</div>
                  <div>Term: {termMonths} months</div>
                  <div>Interest Rate: 15% annually</div>
                  <div>Estimated Monthly Payment: ~{(parseFloat(loanAmount) * 1.15 / parseInt(termMonths)).toFixed(4)} ETH</div>
                </div>
              </div>
            )}

            <Button
              onClick={handleLoanRequest}
              disabled={!loanAmount || !purpose || !hasMinimumSavings || isRequestPending || isRequestConfirming}
              className="w-full"
            >
              {isRequestPending || isRequestConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isRequestPending ? 'Submitting...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Loan Request
                </>
              )}
            </Button>

            {!hasMinimumSavings && (
              <div className="text-sm text-red-600 text-center">
                You need at least {minimumSavings} ETH in savings to request a loan
              </div>
            )}

            {requestHash && (
              <div className="text-xs text-gray-600">
                Transaction: {requestHash.slice(0, 10)}...{requestHash.slice(-8)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loan Repayment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span>Loan Repayment</span>
          </CardTitle>
          <CardDescription>
            Make payments on your active loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loanId">Loan ID</Label>
                <Input
                  id="loanId"
                  type="number"
                  placeholder="Enter loan ID"
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  disabled={isRepayPending || isRepayConfirming}
                />
              </div>
              <div>
                <Label htmlFor="repaymentAmount">Payment Amount (ETH)</Label>
                <Input
                  id="repaymentAmount"
                  type="number"
                  step="0.001"
                  placeholder="0.0"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  disabled={isRepayPending || isRepayConfirming}
                />
              </div>
            </div>

            <Button
              onClick={handleRepayment}
              disabled={!repaymentAmount || !selectedLoanId || isRepayPending || isRepayConfirming}
              variant="outline"
              className="w-full"
            >
              {isRepayPending || isRepayConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isRepayPending ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Make Payment
                </>
              )}
            </Button>

            {repayHash && (
              <div className="text-xs text-gray-600">
                Transaction: {repayHash.slice(0, 10)}...{repayHash.slice(-8)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Status */}
      {(isRequestConfirming || isRepayConfirming) && (
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

      {/* Smart Contract Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Smart Contract Benefits</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium">Automated</div>
              <div className="text-sm text-gray-600">Smart contract handles approval and payments</div>
            </div>
            <div className="text-center p-3">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium">Transparent</div>
              <div className="text-sm text-gray-600">All loan terms stored on-chain</div>
            </div>
            <div className="text-center p-3">
              <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-medium">Fair Interest</div>
              <div className="text-sm text-gray-600">15% annual rate, no hidden fees</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
