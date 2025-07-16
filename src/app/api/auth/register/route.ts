import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { generateId } from "@/lib/utils"

export async function POST(request: NextRequest) {
    try {
        // Add database connection check
        console.log("Registration attempt started")
        
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            nationalId,
            address
        } = await request.json()

        console.log("Registration data received:", { firstName, lastName, email, phone: !!phone, nationalId: !!nationalId })

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            console.log("Validation failed: missing required fields")
            return NextResponse.json(
                { error: "First name, last name, email, and password are required" },
                { status: 400 }
            )
        }

        console.log("Checking for existing user...")
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
            console.log("User already exists:", existingUser.email)
            let field = "email"
            if (existingUser.phone === phone) field = "phone number"
            if (existingUser.nationalId === nationalId) field = "national ID"

            return NextResponse.json(
                { error: `User with this ${field} already exists` },
                { status: 409 }
            )
        }

        console.log("Hashing password...")
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        console.log("Creating user in database...")
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

        console.log("User created successfully:", user.id)
        // Return success (without password)
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({
            message: "Registration successful. Your application is pending approval.",
            user: userWithoutPassword
        }, { status: 201 })

    } catch (error) {
        console.error("Registration error details:", error)
        
        // More specific error handling
        if (error instanceof Error) {
            console.error("Error message:", error.message)
            console.error("Error stack:", error.stack)
            
            // Handle specific Prisma errors
            if (error.message.includes('Prisma')) {
                return NextResponse.json(
                    { error: "Database connection error. Please try again later." },
                    { status: 503 }
                )
            }
            
            // Handle validation errors
            if (error.message.includes('Unique constraint')) {
                return NextResponse.json(
                    { error: "User with this information already exists" },
                    { status: 409 }
                )
            }
        }
        
        return NextResponse.json(
            { error: "Internal server error. Please try again later." },
            { status: 500 }
        )
    }
}
