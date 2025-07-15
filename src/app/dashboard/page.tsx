"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, CreditCard, Vote, LogOut, BarChart, Shield } from "lucide-react"
import { WalletConnection } from "@/components/web3/WalletConnection"

interface UserData {
    id: string
    firstName: string
    lastName: string
    email: string
    membershipNumber: string | null
    role: string
    membershipStatus: string
}

export default function DashboardPage() {
    const [user, setUser] = useState<UserData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
            return
        }

        try {
            const response = await fetch("/api/user/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error("Authentication failed")
            }

            const userData = await response.json()
            setUser(userData)
        } catch (error) {
            console.error("Auth check failed:", error)
            localStorage.removeItem("token")
            router.push("/login")
        } finally {
            setIsLoading(false)
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
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
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
                                <h1 className="text-xl font-bold text-gray-900">Village SACCO</h1>
                                <p className="text-sm text-gray-600">Member Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <WalletConnection />
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-600 capitalize">
                                    {user.role.toLowerCase()} • {user.membershipStatus.toLowerCase()}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome back, {user.firstName}!
                    </h2>
                    <p className="text-gray-600">
                        {user.membershipNumber
                            ? `Member #${user.membershipNumber}`
                            : "Your membership is pending approval"
                        }
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$0.00</div>
                            <p className="text-xs text-muted-foreground">
                                No transactions yet
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                No active loans
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$0.00</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Voting Power</CardTitle>
                            <Vote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">
                                Vote per proposal
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Wallet className="h-5 w-5 text-blue-600" />
                                <span>Savings Account</span>
                            </CardTitle>
                            <CardDescription>
                                Deposit money and earn interest on your savings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href="/savings">
                                    <Button className="w-full">Make Deposit</Button>
                                </Link>
                                <Link href="/savings">
                                    <Button variant="outline" className="w-full">View Transactions</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-green-600" />
                                <span>Loan Services</span>
                            </CardTitle>
                            <CardDescription>
                                Apply for loans and manage repayments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href="/loans/apply">
                                    <Button className="w-full">Apply for Loan</Button>
                                </Link>
                                <Link href="/loans">
                                    <Button variant="outline" className="w-full">View Loan History</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Vote className="h-5 w-5 text-purple-600" />
                                <span>Governance</span>
                            </CardTitle>
                            <CardDescription>
                                Participate in SACCO decision making
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href="/governance">
                                    <Button className="w-full">View Proposals</Button>
                                </Link>
                                <Link href="/governance/create">
                                    <Button variant="outline" className="w-full">Create Proposal</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-orange-600" />
                                <span>Blockchain SACCO</span>
                            </CardTitle>
                            <CardDescription>
                                Secure on-chain savings and loans with smart contracts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href="/blockchain/savings">
                                    <Button className="w-full">On-Chain Savings</Button>
                                </Link>
                                <Link href="/blockchain/loans">
                                    <Button variant="outline" className="w-full">Blockchain Loans</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart className="h-5 w-5 text-indigo-600" />
                                <span>Analytics</span>
                            </CardTitle>
                            <CardDescription>
                                View financial insights and performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href="/analytics">
                                    <Button className="w-full">View Analytics</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
