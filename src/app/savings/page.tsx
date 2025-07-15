"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, History, Plus, Shield } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { WalletConnection } from "@/components/web3/WalletConnection"
import { BlockchainSavings } from "@/components/web3/BlockchainSavings"

interface SavingsAccount {
  id: string
  accountType: string
  balance: number
  interestRate: number
  totalInterestEarned: number
  createdAt: string
  lastInterestCalculated: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
  status: string
}

export default function SavingsPage() {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      // Fetch savings accounts
      const accountsResponse = await fetch("/api/savings/accounts", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json()
        setAccounts(accountsData)
        if (accountsData.length > 0) {
          setSelectedAccount(accountsData[0].id)
        }
      }

      // Fetch transactions
      const transactionsResponse = await fetch("/api/savings/transactions", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createAccount = async () => {
    const token = localStorage.getItem("token")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/savings/accounts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accountType: "REGULAR"
        })
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Failed to create account:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/savings/deposit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accountId: selectedAccount,
          amount: parseFloat(amount),
          description: description || "Deposit"
        })
      })

      if (response.ok) {
        setAmount("")
        setDescription("")
        setShowDepositForm(false)
        await fetchData()
      }
    } catch (error) {
      console.error("Deposit failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/savings/withdraw", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accountId: selectedAccount,
          amount: parseFloat(amount),
          description: description || "Withdrawal"
        })
      })

      if (response.ok) {
        setAmount("")
        setDescription("")
        setShowWithdrawForm(false)
        await fetchData()
      }
    } catch (error) {
      console.error("Withdrawal failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const totalInterest = accounts.reduce((sum, account) => sum + account.totalInterestEarned, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Savings Accounts</h1>
                <p className="text-sm text-gray-600">Traditional and blockchain savings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnection />
              <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">
                Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInterest)}</div>
              <p className="text-xs text-muted-foreground">
                Total lifetime earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={createAccount}
                disabled={isProcessing}
              >
                Create New Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Savings Accounts</h3>
                <p className="text-gray-600 mb-4">Create your first savings account to start earning interest</p>
                <Button onClick={createAccount} disabled={isProcessing}>
                  {isProcessing ? "Creating..." : "Create Savings Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Account Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>Your savings account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{account.accountType} Savings</h4>
                          <p className="text-sm text-gray-600">
                            Created {formatDate(new Date(account.createdAt))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(account.balance)}</p>
                          <p className="text-xs text-green-600">{account.interestRate}% APY</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Interest earned: {formatCurrency(account.totalInterestEarned)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      className="flex items-center space-x-2"
                      onClick={() => setShowDepositForm(true)}
                      disabled={accounts.length === 0}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Deposit</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => setShowWithdrawForm(true)}
                      disabled={accounts.length === 0 || totalBalance === 0}
                    >
                      <ArrowDownLeft className="h-4 w-4" />
                      <span>Withdraw</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Deposit Form */}
              {showDepositForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Make a Deposit</CardTitle>
                    <CardDescription>Add funds to your savings account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDeposit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Input
                          id="description"
                          placeholder="What is this deposit for?"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Deposit"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowDepositForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Withdraw Form */}
              {showWithdrawForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Make a Withdrawal</CardTitle>
                    <CardDescription>Withdraw funds from your savings account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleWithdraw} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdrawAmount">Amount</Label>
                        <Input
                          id="withdrawAmount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          min="0.01"
                          max={totalBalance}
                          step="0.01"
                        />
                        <p className="text-xs text-gray-600">
                          Available balance: {formatCurrency(totalBalance)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="withdrawDescription">Description (optional)</Label>
                        <Input
                          id="withdrawDescription"
                          placeholder="What is this withdrawal for?"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Withdraw"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowWithdrawForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Transaction History</span>
                </CardTitle>
                <CardDescription>Recent savings account activity</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {transaction.type === "DEPOSIT" ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-gray-600">
                              {formatDate(new Date(transaction.createdAt))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === "DEPOSIT" ? "text-green-600" : "text-red-600"
                            }`}>
                            {transaction.type === "DEPOSIT" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">
                            {transaction.status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
