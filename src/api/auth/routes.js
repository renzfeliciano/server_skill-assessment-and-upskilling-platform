import { Router } from "express"
import MiddlewareUtils from "../../utils/middleware.js"
import AuthValidation from "./validation.js"
import AuthController from "./controller.js"

const AuthRoutes = Router()

AuthRoutes
    .post('/login', MiddlewareUtils.validateRequest(AuthValidation.login), AuthController.login)
    .post('/register', MiddlewareUtils.validateRequest(AuthValidation.register), AuthController.register)
    .post('/logout', MiddlewareUtils.authenticateToken, AuthController.logout)
    .post('/refresh-token', MiddlewareUtils.validateRequest(AuthValidation.refreshToken), AuthController.refreshAccessToken)

export default AuthRoutes