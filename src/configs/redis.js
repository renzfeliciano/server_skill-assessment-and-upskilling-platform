import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const REDIS_CACHE_VALIDITY = Number(process.env.SEVEN_DAYS_IN_SECONDS) || 604800 // Default to 7 days in seconds
let client = null

class RedisUtils {
    constructor() {
        if (!client) {
            client = createClient({
                password: process.env.REDIS_PASS || 'your_redis_password',
                socket: {
                    host: process.env.REDIS_HOST || 'your_redis_host',
                    port: Number(process.env.REDIS_PORT) || 6379,
                },
            })

            client.on('error', (err) => {
                console.error('Redis Client Error', err)
            })

            client.on('end', () => {
                console.warn('Redis connection closed. Attempting to reconnect...')
                setTimeout(() => this.connect(), 5000) // Reconnect after 5 seconds
            })

            this.client = client
        } else {
            this.client = client
        }
    }

    async connect() {
        if (this.client.status !== 'ready') {
            try {
                await this.client.connect()
                console.log('✅ Connected to Redis successfully')
            } catch (error) {
                console.error('Error connecting to Redis:', error.message)
                throw new Error('Failed to connect to Redis')
            }
        } else {
            console.log('Redis client already connected')
        }
    }

    async disconnect() {
        try {
            await this.client.disconnect()
            console.log('Disconnected from Redis')
        } catch (error) {
            console.error('Error disconnecting from Redis:', error.message)
        }
    }

    async getCache(cacheKey) {
        try {
            return await this.client.get(cacheKey)
        } catch (error) {
            console.error('Error getting cache:', error.message)
            throw new Error('Failed to get cache')
        }
    }

    async setCache(cacheKey, cacheData, ttl = REDIS_CACHE_VALIDITY) {
        try {
            return await this.client.setEx(cacheKey, ttl, cacheData)
        } catch (error) {
            console.error('Error setting cache:', error.message)
            throw new Error('Failed to set cache')
        }
    }

    async setExCache(cacheKey, cacheData) {
        try {
            return await this.client.setEx(cacheKey, REDIS_CACHE_VALIDITY, cacheData)
        } catch (error) {
            console.error('Error setting cache:', error.message)
            throw new Error('Failed to set cache')
        }
    }

    async deleteCache(cacheKey) {
        try {
            return await this.client.del(cacheKey)
        } catch (error) {
            console.error('Error deleting cache:', error.message)
            throw new Error('Failed to delete cache')
        }
    }

    async getAndDeleteCache(cacheKey) {
        try {
            const cache = await this.client.get(cacheKey)
            if (cache) {
                await this.client.del(cacheKey)
                return cache
            }
        } catch (error) {
            console.error('Error getting and deleting cache:', error.message)
            throw new Error('Failed to get and delete cache')
        }
    }
}
 
export default new RedisUtils()