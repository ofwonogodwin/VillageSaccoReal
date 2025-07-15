import { NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { db } from "@/lib/db"
import { verifyMessage } from "viem"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message } = await request.json()

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: "Wallet address, signature, and message are required" },
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

    // Find user by wallet address
    const user = await db.user.findFirst({
      where: {
        walletAddress,
        isWalletVerified: true,
        isActive: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Wallet not registered or not verified" },
        { status: 401 }
      )
    }

    // Check if user is approved
    if (user.membershipStatus === "PENDING") {
      return NextResponse.json(
        { error: "Your membership is still pending approval" },
        { status: 403 }
      )
    }

    if (user.membershipStatus === "SUSPENDED" || user.membershipStatus === "TERMINATED") {
      return NextResponse.json(
        { error: "Your account has been suspended or terminated" },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    )

    return NextResponse.json({
      message: "Wallet login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        membershipStatus: user.membershipStatus,
        membershipNumber: user.membershipNumber,
        walletAddress: user.walletAddress
      }
    })

  } catch (error) {
    console.error("Wallet login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
