"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletConnection } from "@/components/web3/WalletConnection"
import { BlockchainSavings } from "@/components/web3/BlockchainSavings"
import { Wallet, ArrowLeft, Shield, TrendingUp, DollarSign } from "lucide-react"
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

export default function BlockchainSavingsPage() {
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

    const handleLogout = () => {
        localStorage.removeItem("token")
        router.push("/")
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading blockchain savings...</p>
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
                                <Shield className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Blockchain Savings</h1>
                                    <p className="text-sm text-gray-600">Secure on-chain savings account</p>
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
                                    <Wallet className="h-6 w-6 text-blue-600" />
                                    <span>Connect Your Wallet</span>
                                </CardTitle>
                                <CardDescription>
                                    To access blockchain savings features, please connect your wallet
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center space-y-4">
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 border rounded-lg">
                                        <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <h3 className="font-semibold text-sm">Secure</h3>
                                        <p className="text-xs text-gray-600">Your funds are protected by smart contracts</p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                        <h3 className="font-semibold text-sm">Transparent</h3>
                                        <p className="text-xs text-gray-600">All transactions are visible on the blockchain</p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                        <h3 className="font-semibold text-sm">Interest</h3>
                                        <p className="text-xs text-gray-600">Earn interest on your savings automatically</p>
                                    </div>
                                </div>
                                <WalletConnection />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Blockchain Savings Component */}
                        <BlockchainSavings />

                        {/* Information Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <span>How It Works</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                                        <div>
                                            <h4 className="font-semibold text-sm">Connect Wallet</h4>
                                            <p className="text-xs text-gray-600">Connect your MetaMask or compatible wallet</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                                        <div>
                                            <h4 className="font-semibold text-sm">Deposit ETH</h4>
                                            <p className="text-xs text-gray-600">Deposit ETH to start earning interest</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                                        <div>
                                            <h4 className="font-semibold text-sm">Earn Interest</h4>
                                            <p className="text-xs text-gray-600">Automatically earn interest on your deposits</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <span>Benefits</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Security</span>
                                            <span className="text-sm text-green-600">Smart Contract Protected</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Transparency</span>
                                            <span className="text-sm text-blue-600">Blockchain Verified</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Interest Rate</span>
                                            <span className="text-sm text-purple-600">5% APY</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Accessibility</span>
                                            <span className="text-sm text-orange-600">24/7 Available</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
