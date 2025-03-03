import DatabaseConfig from './database.js'
import RedisUtils from './redis.js'

class ConnectionConfig {
    async initialize() {
        try {
            await DatabaseConfig.connect() // Ensure DB connection
            await RedisUtils.connect() // Connect Redis
            console.log("✅ All connections initialized successfully")
        } catch (err) {
            console.error('Error initializing connections:', err)
        }
    }
}

export default new ConnectionConfig()