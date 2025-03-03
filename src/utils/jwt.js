import dotenv from "dotenv"
import jwt from 'jsonwebtoken'
import AppError from "./error.js"
import RedisUtils from "../configs/redis.js"

dotenv.config()

class JwtUtils {
    constructor() {
        this.secretKey = process.env.TOKEN_SECRET ?? 'your token secretKey'
        this.refreshSecretKey = process.env.TOKEN_SECRET ?? 'your refresh token secretKey'
        this.accessExpiresIn = process.env.TOKEN_EXPIRATION ?? '15m'
        this.refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRATION ?? '7d'
    }

    // Method to generate access and refresh tokens
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, this.secretKey, { expiresIn: this.accessExpiresIn })
        const refreshToken = jwt.sign(payload, this.refreshSecretKey, { expiresIn: this.refreshExpiresIn })
        return { accessToken, refreshToken }
    }

    // Method to verify a JWT
    verifyToken(req, next, token) {
        jwt.verify(token, this.secretKey, (err, user) => {
            if (err) {
                return next(new AppError("AUTHORIZATION_ERROR", 403, "Invalid or expired token."))
            }

            req.user = user // Attach the user info to the request
            next()
        })
    }

    async verifyRefreshToken(accountId, refreshToken) {
        try {
            // Check if the refresh token exists in Redis
            const cachedRefreshToken = await RedisUtils.getCache(`refreshToken:${accountId}`)
    
            if (!cachedRefreshToken) {
                throw new AppError('INVALID_REFRESH_TOKEN', 403, 'Invalid refresh token or token expired.')
            }

            // Check if the refresh token is blacklisted
            const blacklisted = await RedisUtils.getCache(`blacklist:${refreshToken}`)

            if (blacklisted) {
                throw new AppError('INVALID_REFRESH_TOKEN', 403, 'This refresh token has been invalidated.')
            }
    
            // Verify the refresh token using JWT
            const tokenDetails = await new Promise((resolve, reject) => {
                jwt.verify(refreshToken, this.refreshSecretKey, (err, decoded) => {
                    if (err) {
                        return reject({ error: true, message: "Invalid refresh token" })
                    }
                    resolve(decoded)  // Return decoded token details if valid
                })
            })
    
            // Blacklist the old refresh token to ensure it cannot be reused
            await RedisUtils.setExCache(`blacklist:${refreshToken}`, 'true')
            // Remove the refresh token from Redis to invalidate it
            await RedisUtils.deleteCache(`refreshToken:${accountId}`)
            // Return the decoded details from the refresh token
            return { ...tokenDetails }
        } catch (error) {
            throw new AppError('INVALID_REFRESH_TOKEN', 403, error.message || 'Error verifying refresh token.')
        }
    }
    
}

export default new JwtUtils()
