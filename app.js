import express from "express"
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan"
import { rateLimit } from "express-rate-limit"
import ConnectionConfig from "./src/configs/connection.js"
import Routes from "./src/routes/index.js"
import MiddlewareUtils from "./src/utils/middleware.js"

dotenv.config()
const app = express()

// Initialize connection/s
await ConnectionConfig.initialize().catch(err => { console.log(err) })

// Middlewares
app.use(MiddlewareUtils.requestIdMiddleware)
app.use(helmet({ contentSecurityPolicy: true }))
app.use(MiddlewareUtils.cors)
app.use(rateLimit(MiddlewareUtils.limiter))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// Conditional logging middleware only in development mode
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined')) // Use 'combined' format for detailed logs
}
// API routes
app.use('/api/v1', Routes())
// Handle 404 (Not Found)
app.use(MiddlewareUtils.notFound)
// Global error handling middleware
app.use(MiddlewareUtils.errorHandler)

export default app