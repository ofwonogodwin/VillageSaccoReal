import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyMessage } from "viem"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      nationalId,
      address,
      walletAddress,
      signature,
      message
    } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !nationalId || !address || !walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Verify the signature
    try {
      const isValid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid wallet signature" },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Check if wallet address already exists
    const existingWallet = await db.user.findFirst({
      where: { walletAddress }
    })

    if (existingWallet) {
      return NextResponse.json(
        { error: "Wallet address already registered" },
        { status: 400 }
      )
    }

    // Generate a random password for wallet users (they won't use it for login)
    const randomPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(randomPassword, 12)

    // Create user with wallet verification
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        nationalId,
        address,
        password: hashedPassword,
        walletAddress,
        isWalletVerified: true,
        membershipStatus: "PENDING", // Still needs admin approval
        role: "MEMBER"
      }
    })

    return NextResponse.json({
      message: "Wallet registration successful! Your application is pending approval.",
      userId: user.id,
      walletAddress: user.walletAddress
    })

  } catch (error) {
    console.error("Wallet registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
