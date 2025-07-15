"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletConnection } from "@/components/web3/WalletConnection"
import { BlockchainLoans } from "@/components/web3/BlockchainLoans"
import { Wallet, ArrowLeft, Shield, TrendingUp, DollarSign, Clock, Users, CheckCircle } from "lucide-react"
import { useAccount } from "wagmi"

interface UserData {
    id: string
    firstName: string
    lastName: string
    email: string
    membershipNumber: string | null
    role: string
    membershipStatus: string
}

export default function BlockchainLoansPage() {
    const [user, setUser] = useState<UserData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { isConnected } = useAccount()
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading blockchain loans...</p>
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
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-green-600" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Blockchain Loans</h1>
                                    <p className="text-sm text-gray-600">Smart contract-powered lending</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <WalletConnection />
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Member #{user.membershipNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {!isConnected ? (
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="flex items-center justify-center space-x-2">
                                    <Wallet className="h-6 w-6 text-green-600" />
                                    <span>Connect Your Wallet</span>
                                </CardTitle>
                                <CardDescription>
                                    To access blockchain loan features, please connect your wallet
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center space-y-4">
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 border rounded-lg">
                                        <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <h3 className="font-semibold text-sm">Secure</h3>
                                        <p className="text-xs text-gray-600">Smart contracts ensure loan security</p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                        <h3 className="font-semibold text-sm">Fast</h3>
                                        <p className="text-xs text-gray-600">Instant approval for eligible members</p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                        <h3 className="font-semibold text-sm">Fair Rates</h3>
                                        <p className="text-xs text-gray-600">Competitive interest rates</p>
                                    </div>
                                </div>
                                <WalletConnection />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Blockchain Loans Component */}
                        <BlockchainLoans />

                        {/* Information Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <span>Loan Requirements</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-sm">Active SACCO membership</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-sm">Minimum savings balance required</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-sm">Connected wallet with sufficient collateral</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-sm">Good standing with previous loans</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        <span>Loan Terms</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Interest Rate</span>
                                            <span className="text-sm text-green-600">8% APR</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Collateral</span>
                                            <span className="text-sm text-blue-600">150% of loan value</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Max Duration</span>
                                            <span className="text-sm text-purple-600">24 months</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Processing</span>
                                            <span className="text-sm text-orange-600">Instant</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* How It Works */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                    <span>How Blockchain Loans Work</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
                                        <h3 className="font-semibold text-sm mb-2">Request Loan</h3>
                                        <p className="text-xs text-gray-600">Submit loan application with desired amount and duration</p>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
                                        <h3 className="font-semibold text-sm mb-2">Smart Contract Check</h3>
                                        <p className="text-xs text-gray-600">Automatic eligibility verification using smart contracts</p>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
                                        <h3 className="font-semibold text-sm mb-2">Collateral Lock</h3>
                                        <p className="text-xs text-gray-600">Required collateral is locked in the smart contract</p>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">4</div>
                                        <h3 className="font-semibold text-sm mb-2">Receive Funds</h3>
                                        <p className="text-xs text-gray-600">Loan amount is transferred to your wallet instantly</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
