import User from "../users/model.js"
import QueryHelperUtils from "../../utils/queryHelper.js"
import JwtUtils from "../../utils/jwt.js"
import AppError from "../../utils/error.js"
import RedisUtils from "../../configs/redis.js"

class AuthService {
    async login(payload) {
        const { email, password } = payload
        const user = await QueryHelperUtils.getDocument(User, { email: email })
        const isPasswordMatch = user && await user.verifyPassword(password)

        if (!user || !isPasswordMatch) {
            throw new AppError('INVALID_CREDENTIALS', 401, 'Please check your email and password and try again.')
        }

        // Invalidate old refresh token
        await RedisUtils.getAndDeleteCache(`refreshToken:${user._id.toString()}`)

        const { _id, name } = user
        const tokens = JwtUtils.generateTokens({
            _id,
            name,
            email,
        })
        
        // Save new refresh token w/ expiration
        await RedisUtils.setExCache(`refreshToken:${user._id.toString()}`, tokens.refreshToken)

        return { 
            ...tokens,
            account: {
                _id,
                name,
                email,
            }
        }
    }

    async register(payload) {
        const { email } = payload
        const existingUser = await QueryHelperUtils.getDocument(User, { email })

        if (existingUser) {
            throw new AppError('EMAIL_ALREADY_EXISTS', 409, 'Email already exists. Please sign in.')
        }

        const user = await QueryHelperUtils.createDocument(User, payload)

        const { _id, name, email: _email } = user
        const tokens = JwtUtils.generateTokens({
            _id,
            name,
            email: _email,
        })
        
        await RedisUtils.setExCache(`refreshToken:${user._id.toString()}`, tokens.refreshToken)

        return { 
            ...tokens,
            account: {
                _id,
                name,
                email,
            }
        }
    }

    async logout(req) {
        if (!req.user) {
            throw new AppError('AUTHENTICATION_ERROR, 401, Not authenticated.')
        }
        
        const token = req.headers['authorization'].split(' ')[1]
        await RedisUtils.setExCache(`blacklist:${token}`, 'true')
        await RedisUtils.deleteCache(`refreshToken:${req.user._id.toString()}`)
        req.user = null

        return { 
            message: "You've been logged out."
        }
    }

    async refreshAccessToken(req) {
        try {
            const { accountId, refreshToken } = req.body
            const user = await JwtUtils.verifyRefreshToken(accountId, refreshToken)

            if (!user) {
                throw new AppError('INVALID_REFRESH_TOKEN', 403, 'Failed to refresh access token.')
            }
            const { _id, name, email } = user
            const newTokens = JwtUtils.generateTokens({
                _id,
                name,
                email,
            })

            // Save new refresh token w/ expiration
            await RedisUtils.setExCache(`refreshToken:${user._id.toString()}`, newTokens.refreshToken)

            return { 
                ...newTokens,
                account: {
                    _id,
                    name,
                    email,
                }
            }
        } catch (error) {
            console.log(error)
            throw new AppError('INVALID_REFRESH_TOKEN', 403, 'Failed to refresh access token.')
        }
    }
}

export default new AuthService()