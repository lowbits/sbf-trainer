import {userIdSchema} from "~~/server/utils/schema";

import {z} from "zod";
import crypto from 'node:crypto'

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key'


export function generateAnonymousUserId(): string {
    const userId = `anon_${crypto.randomUUID()}`

    console.log(userId)
    // Validate generated ID
    const result = userIdSchema.safeParse(userId)
    if (!result.success) {
        throw new Error('Generated user ID is invalid')
    }

    return userId
}

export function createUserToken(userId: string): string {
    // Validate userId format first
    const result = userIdSchema.safeParse(userId)
    if (!result.success) {
        throw new Error('Invalid user ID format')
    }

    const timestamp = Date.now()
    const payload = `${userId}.${timestamp}`
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(payload)
        .digest('hex')
        .substring(0, 16)

    return `${payload}.${signature}`
}

export function verifyUserToken(token: string): string | null {
    try {
        // Basic token format validation
        const tokenSchema = z.string().regex(/^anon_[0-9a-f-]+\.\d+\.[0-9a-f]{16}$/)
        const tokenValidation = tokenSchema.safeParse(token)

        if (!tokenValidation.success) {
            return null
        }

        const parts = token.split('.')
        if (parts.length !== 3) return null

        const [userId, timestamp, signature] = parts
        const payload = `${userId}.${timestamp}`

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(payload)
            .digest('hex')
            .substring(0, 16)

        if (signature !== expectedSignature) return null

        // Check if token is not too old (30 days)
        const tokenAge = Date.now() - parseInt(timestamp)
        const maxAge = 30 * 24 * 60 * 60 * 1000

        if (tokenAge > maxAge) return null

        // Validate userId format with Zod
        const userIdValidation = userIdSchema.safeParse(userId)
        if (!userIdValidation.success) return null

        return userId

    } catch (error) {
        return null
    }
}


export function getUserIdFromEvent(event: any): string {
    const cookieToken = getCookie(event, 'sbf_user_token')
    const authHeader = getHeader(event, 'authorization')
    const headerToken = authHeader?.replace('Bearer ', '')

    const token = cookieToken || headerToken

    if (token) {
        const userId = verifyUserToken(token)
        if (userId) {
            return userId
        }
    }

    // Generate new user if no valid token
    const newUserId = generateAnonymousUserId()
    const newToken = createUserToken(newUserId)

    // Set cookie for future requests
    setCookie(event, 'sbf_user_token', newToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
    })

    return newUserId
}

