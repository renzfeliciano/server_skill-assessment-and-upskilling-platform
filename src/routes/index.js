import express from "express"
import MiddlewareUtils from "../utils/middleware.js"
import AzureAIRoutes from "../api/AzureAI/routes.js"
import AuthRoutes from "../api/auth/routes.js"
import UserRoutes from "../api/users/routes.js"

export default () => {
    const router = express.Router()
    // Register routes
    router.use('/auth', AuthRoutes)
    router.use('/aikamuna', MiddlewareUtils.authenticateToken, AzureAIRoutes)
    router.use('/users', MiddlewareUtils.authenticateToken, UserRoutes)
    
    return router
}