import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Wallet, Vote, TrendingUp } from "lucide-react"

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Wallet className="h-8 w-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Village SACCO</h1>
                        </div>
                        <div className="flex space-x-4">
                            <Button variant="outline">Login</Button>
                            <Button>Get Started</Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Blockchain-Powered Financial Cooperative
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Empowering communities through decentralized savings, loans, and governance.
                        Join the future of cooperative finance built on transparency and trust.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button size="lg" className="flex items-center space-x-2">
                            <span>Join SACCO</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="lg">Learn More</Button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h3>
                    <p className="text-gray-600">Everything you need for cooperative financial management</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader>
                            <Users className="h-8 w-8 text-blue-600 mb-2" />
                            <CardTitle className="text-lg">Member Management</CardTitle>
                            <CardDescription>
                                Seamless registration, approval, and role management for all cooperative members.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Wallet className="h-8 w-8 text-green-600 mb-2" />
                            <CardTitle className="text-lg">Savings & Loans</CardTitle>
                            <CardDescription>
                                Secure savings accounts with interest and transparent loan application system.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Vote className="h-8 w-8 text-purple-600 mb-2" />
                            <CardTitle className="text-lg">Governance</CardTitle>
                            <CardDescription>
                                Democratic decision-making through proposal creation and transparent voting.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
                            <CardTitle className="text-lg">Analytics</CardTitle>
                            <CardDescription>
                                Comprehensive dashboards and reports for financial transparency.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <h4 className="text-3xl font-bold text-blue-600 mb-2">50+</h4>
                            <p className="text-gray-600">Active Members</p>
                        </div>
                        <div>
                            <h4 className="text-3xl font-bold text-green-600 mb-2">$25,000</h4>
                            <p className="text-gray-600">Total Savings</p>
                        </div>
                        <div>
                            <h4 className="text-3xl font-bold text-purple-600 mb-2">98%</h4>
                            <p className="text-gray-600">Loan Repayment Rate</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2025 Village SACCO. Built with Next.js, Prisma, and Blockchain technology.</p>
                </div>
            </footer>
        </div>
    )
}
