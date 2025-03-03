import AuthService from "./service.js"
import JwtUtils from "../../utils/jwt.js"

class AuthController {
    async login(req, res, next) {
        try {
            const result = await AuthService.login(req.body)
            res.status(200).json(result)
        } catch (error) {
            next(error)
        }
        
    }

    async register(req, res, next) {
        try {
            const result = await AuthService.register(req.body)
            res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }

    async logout (req, res, next) {
        try {
            const result = await AuthService.logout(req)
            res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }

    async refreshAccessToken(req, res, next) {
        try {
            const result = await AuthService.refreshAccessToken(req)
            res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }
}

export default new AuthController()