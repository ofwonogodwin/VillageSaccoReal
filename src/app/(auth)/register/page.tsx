"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, AlertCircle, CheckCircle, Shield } from "lucide-react"
import { useAccount, useSignMessage } from "wagmi"
import { WalletConnection } from "@/components/web3/WalletConnection"
import Link from "next/link"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        nationalId: "",
        address: ""
    })
    const [walletFormData, setWalletFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nationalId: "",
        address: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [registrationMethod, setRegistrationMethod] = useState<"traditional" | "wallet">("traditional")

    const { address: walletAddress, isConnected } = useAccount()
    const { signMessage, isPending: isSigningPending } = useSignMessage()
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWalletFormData({
            ...walletFormData,
            [e.target.name]: e.target.value
        })
    }

    const handleTraditionalSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Registration failed")
            }

            setSuccess(true)
            setRegistrationMethod("traditional")
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleWalletSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isConnected || !walletAddress) {
            setError("Please connect your wallet first")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            // Create a message to sign for verification
            const message = `Village SACCO Registration\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`

            const signature = await signMessage({ message })

            // Submit registration with wallet data
            const response = await fetch("/api/auth/register-wallet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...walletFormData,
                    walletAddress,
                    signature,
                    message
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Wallet registration failed")
            }

            setSuccess(true)
            setRegistrationMethod("wallet")
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                            <p className="text-gray-600 mb-4">
                                Your application has been submitted for approval.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                                    <p className="text-blue-800 font-medium text-sm">
                                        Registration Review Process
                                    </p>
                                </div>
                                <p className="text-blue-700 text-sm mt-2">
                                    Your registration will be reviewed and approved within <strong>24 hours</strong>.
                                    You will receive an email notification once your account is approved and ready to use.
                                </p>
                            </div>
                            <p className="text-gray-600 text-sm">
                                You will be redirected to the login page shortly.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Wallet className="h-12 w-12 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Join Village SACCO</h1>
                    <p className="text-gray-600 mt-2">Create your account to get started</p>
                </div>

                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-center text-xl">Join Village SACCO</CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            Choose your registration method
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="traditional" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="traditional" className="flex items-center space-x-2 group">
                                    <Wallet className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                    <span>Traditional</span>
                                </TabsTrigger>
                                <TabsTrigger value="wallet" className="flex items-center space-x-2 group">
                                    <Shield className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                    <span>Web3 Wallet</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Traditional Registration */}
                            <TabsContent value="traditional" className="space-y-4">
                                <form onSubmit={handleTraditionalSubmit} className="space-y-4">
                                    {error && (
                                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm">{error}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                placeholder="John"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="+1 (555) 123-4567"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nationalId">National ID</Label>
                                        <Input
                                            id="nationalId"
                                            name="nationalId"
                                            placeholder="12345678"
                                            value={formData.nationalId}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            placeholder="123 Main St, City, Country"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Creating Account..." : "Create Account"}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Wallet Registration */}
                            <TabsContent value="wallet" className="space-y-4">
                                {!isConnected ? (
                                    <div className="space-y-4">
                                        <div className="text-center p-4 border rounded-lg">
                                            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                            <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Connect your MetaMask or compatible wallet to register with blockchain verification
                                            </p>
                                        </div>
                                        <WalletConnection />
                                    </div>
                                ) : (
                                    <form onSubmit={handleWalletSubmit} className="space-y-4">
                                        {error && (
                                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm">{error}</span>
                                            </div>
                                        )}

                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm text-green-800">
                                                    Wallet Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="walletFirstName">First Name</Label>
                                                <Input
                                                    id="walletFirstName"
                                                    name="firstName"
                                                    placeholder="John"
                                                    value={walletFormData.firstName}
                                                    onChange={handleWalletChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="walletLastName">Last Name</Label>
                                                <Input
                                                    id="walletLastName"
                                                    name="lastName"
                                                    placeholder="Doe"
                                                    value={walletFormData.lastName}
                                                    onChange={handleWalletChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="walletEmail">Email</Label>
                                            <Input
                                                id="walletEmail"
                                                name="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={walletFormData.email}
                                                onChange={handleWalletChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="walletPhone">Phone Number</Label>
                                            <Input
                                                id="walletPhone"
                                                name="phone"
                                                placeholder="+1234567890"
                                                value={walletFormData.phone}
                                                onChange={handleWalletChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="walletNationalId">National ID</Label>
                                            <Input
                                                id="walletNationalId"
                                                name="nationalId"
                                                placeholder="National ID Number"
                                                value={walletFormData.nationalId}
                                                onChange={handleWalletChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="walletAddress">Address</Label>
                                            <Input
                                                id="walletAddress"
                                                name="address"
                                                placeholder="Full Address"
                                                value={walletFormData.address}
                                                onChange={handleWalletChange}
                                                required
                                            />
                                        </div>

                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-xs text-blue-800">
                                                <Shield className="h-3 w-3 inline mr-1" />
                                                Your wallet will be used for secure blockchain transactions and identity verification.
                                            </p>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={isLoading || isSigningPending}
                                        >
                                            {isLoading || isSigningPending ? "Processing..." : "Register with Wallet"}
                                        </Button>
                                    </form>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-600 hover:underline">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
