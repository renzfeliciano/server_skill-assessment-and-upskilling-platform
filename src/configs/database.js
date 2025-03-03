import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

class DatabaseConfig {
    constructor() {
        this.mongoUri = process.env.MONGO_URI

        if (!this.mongoUri) {
            throw new Error("MONGO_URI is not set in environment variables.")
        }
    }

    async connect() {
        try {
            const conn = await mongoose.connect(this.mongoUri, {
                maxPoolSize: 10
            })
            console.log("✅ Connected to MongoDB successfully")
            return conn.connection.db
        } catch (error) {
            console.error("❌ MongoDB Connection Error:", error.message)
            throw new Error("Failed to connect to MongoDB")
        }
    }
}

export default new DatabaseConfig()