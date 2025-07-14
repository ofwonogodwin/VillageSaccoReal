import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { generateId } from "@/lib/utils"

export async function POST(request: NextRequest) {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            nationalId,
            address
        } = await request.json()

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json(
                { error: "First name, last name, email, and password are required" },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { email: email.toLowerCase() },
                    ...(phone ? [{ phone }] : []),
                    ...(nationalId ? [{ nationalId }] : [])
                ]
            }
        })

        if (existingUser) {
            let field = "email"
            if (existingUser.phone === phone) field = "phone number"
            if (existingUser.nationalId === nationalId) field = "national ID"

            return NextResponse.json(
                { error: `User with this ${field} already exists` },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await db.user.create({
            data: {
                firstName,
                lastName,
                email: email.toLowerCase(),
                phone: phone || null,
                password: hashedPassword,
                nationalId: nationalId || null,
                address: address || null,
                membershipStatus: "PENDING", // Will need admin approval
                role: "MEMBER"
            }
        })

        // Return success (without password)
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({
            message: "Registration successful. Your application is pending approval.",
            user: userWithoutPassword
        }, { status: 201 })

    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
