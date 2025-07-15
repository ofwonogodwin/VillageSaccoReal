"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, AlertCircle, Shield, LogIn } from "lucide-react"
import { useAccount, useSignMessage } from "wagmi"
import { WalletConnection } from "@/components/web3/WalletConnection"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const { address: walletAddress, isConnected } = useAccount()
    const { signMessage, isPending: isSigningPending } = useSignMessage()
    const router = useRouter()

    const handleTraditionalSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        // Debug logging
        console.log("Traditional login attempt:", { email, hasPassword: !!password })

        try {
            const requestBody = { email, password }
            console.log("Sending request to /api/auth/login with:", requestBody)
            
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })
            
            console.log("Response status:", response.status)

            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error || "Login failed"
                
                // Provide user-friendly message for pending approval
                if (errorMessage === "Membership pending approval") {
                    throw new Error("Your account is pending approval. Your registration will be reviewed and approved within 24 hours. Please check your email for updates.")
                }
                
                throw new Error(errorMessage)
            }

            // Store token in localStorage
            localStorage.setItem("token", data.token)

            // Redirect based on user role
            if (data.user.role === "ADMIN") {
                router.push("/admin/dashboard")
            } else {
                router.push("/dashboard")
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleWalletLogin = async () => {
        if (!isConnected || !walletAddress) {
            setError("Please connect your wallet first")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            // Create a message to sign for verification
            const message = `Village SACCO Login\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`

            const signature = await signMessage({ message })

            // Submit login with wallet signature
            const response = await fetch("/api/auth/login-wallet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletAddress,
                    signature,
                    message
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error || "Wallet login failed"
                
                // Provide user-friendly message for pending approval
                if (errorMessage === "Membership pending approval") {
                    throw new Error("Your account is pending approval. Your registration will be reviewed and approved within 24 hours. Please check your email for updates.")
                }
                
                throw new Error(errorMessage)
            }

            // Store token in localStorage
            localStorage.setItem("token", data.token)

            // Redirect based on user role
            if (data.user.role === "ADMIN") {
                router.push("/admin/dashboard")
            } else {
                router.push("/dashboard")
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Wallet className="h-12 w-12 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Village SACCO</h1>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-center text-xl">Welcome Back</CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            Choose your login method
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="traditional" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="traditional" className="flex items-center space-x-2 group">
                                    <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                    <span>Email & Password</span>
                                </TabsTrigger>
                                <TabsTrigger value="wallet" className="flex items-center space-x-2 group">
                                    <Shield className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                    <span>Web3 Wallet</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Traditional Login */}
                            <TabsContent value="traditional" className="space-y-4">
                                <form onSubmit={handleTraditionalSubmit} className="space-y-4">
                                    {error && (
                                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm">{error}</span>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Wallet Login */}
                            <TabsContent value="wallet" className="space-y-4">
                                {error && (
                                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {!isConnected ? (
                                    <div className="space-y-4">
                                        <div className="text-center p-4 border rounded-lg">
                                            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                            <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Connect your registered wallet to sign in securely
                                            </p>
                                        </div>
                                        <WalletConnection />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <Shield className="h-4 w-4 text-green-600" />
                                                <span className="text-sm text-green-800">
                                                    Wallet Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-xs text-blue-800">
                                                Click the button below to sign a message with your wallet to verify your identity and log in.
                                            </p>
                                        </div>

                                        <Button
                                            onClick={handleWalletLogin}
                                            className="w-full"
                                            disabled={isLoading || isSigningPending}
                                        >
                                            {isLoading || isSigningPending ? "Signing in..." : "Sign In with Wallet"}
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-blue-600 hover:underline">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
