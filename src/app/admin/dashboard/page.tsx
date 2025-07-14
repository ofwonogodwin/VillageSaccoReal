"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Wallet,
  TrendingUp,
  UserCheck,
  UserX,
  DollarSign,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface SystemStats {
  totalMembers: number
  pendingMembers: number
  totalSavings: number
  totalLoans: number
  totalTransactions: number
  monthlyGrowth: number
}

interface PendingMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  nationalId: string
  joinedAt: string
}

interface RecentTransaction {
  id: string
  type: string
  amount: number
  user: {
    firstName: string
    lastName: string
  }
  description: string
  createdAt: string
  status: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      // Check if user is admin
      const userResponse = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!userResponse.ok) {
        throw new Error("Authentication failed")
      }

      const userData = await userResponse.json()
      if (userData.role !== "ADMIN") {
        router.push("/dashboard")
        return
      }

      setUser(userData)
      await fetchAdminData(token)
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("token")
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAdminData = async (token: string) => {
    try {
      // Fetch system statistics
      const statsResponse = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch pending members
      const pendingResponse = await fetch("/api/admin/pending-members", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingMembers(pendingData)
      }

      // Fetch recent transactions
      const transactionsResponse = await fetch("/api/admin/recent-transactions", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setRecentTransactions(transactionsData)
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    }
  }

  const handleMemberAction = async (memberId: string, action: 'approve' | 'reject') => {
    const token = localStorage.getItem("token")
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/admin/members/${memberId}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        // Refresh pending members list
        await fetchAdminData(token!)
      }
    } catch (error) {
      console.error(`Failed to ${action} member:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateInterest = async () => {
    const token = localStorage.getItem("token")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/savings/calculate-interest", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Interest calculated for ${result.processed} accounts. Total interest paid: ${formatCurrency(result.totalInterestPaid)}`)
        await fetchAdminData(token!)
      }
    } catch (error) {
      console.error("Failed to calculate interest:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
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
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Village SACCO Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* System Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingMembers || 0} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalSavings || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Across all accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalLoans || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Outstanding amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats?.monthlyGrowth || 0}%</div>
              <p className="text-xs text-muted-foreground">
                vs last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Member Management</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Member Management Tab */}
          <TabsContent value="members">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span>Pending Approvals</span>
                    <Badge variant="secondary">{pendingMembers.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    New member applications awaiting review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No pending applications</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingMembers.map((member) => (
                        <div key={member.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">
                                {member.firstName} {member.lastName}
                              </h4>
                              <p className="text-sm text-gray-600">{member.email}</p>
                              <p className="text-xs text-gray-500">
                                Applied {formatDate(new Date(member.joinedAt))}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mb-3">
                            <p>Phone: {member.phone || "Not provided"}</p>
                            <p>National ID: {member.nationalId || "Not provided"}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleMemberAction(member.id, 'approve')}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMemberAction(member.id, 'reject')}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Administrative tools and operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full justify-start"
                    onClick={calculateInterest}
                    disabled={isProcessing}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Calculate Interest Payments
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/members")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage All Members
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/loans")}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Loan Management
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/reports")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activities across the system</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent transactions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${transaction.type === 'DEPOSIT' ? 'bg-green-100' :
                              transaction.type === 'WITHDRAWAL' ? 'bg-red-100' :
                                'bg-blue-100'
                            }`}>
                            {transaction.type === 'DEPOSIT' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : transaction.type === 'WITHDRAWAL' ? (
                              <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.user.firstName} {transaction.user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(new Date(transaction.createdAt))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === 'DEPOSIT' ? 'text-green-600' :
                              transaction.type === 'WITHDRAWAL' ? 'text-red-600' :
                                'text-blue-600'
                            }`}>
                            {formatCurrency(transaction.amount)}
                          </p>
                          <Badge variant={transaction.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>System Health</span>
                  </CardTitle>
                  <CardDescription>Monitor system status and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Database</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Transactions</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Processing
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Interest Calculation</span>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Scheduled
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure SACCO parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Regular Savings Interest:</span>
                      <span className="font-medium">5.0% APY</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fixed Deposit Interest:</span>
                      <span className="font-medium">8.0% APY</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum Loan Amount:</span>
                      <span className="font-medium">$100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maximum Loan Term:</span>
                      <span className="font-medium">24 months</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
