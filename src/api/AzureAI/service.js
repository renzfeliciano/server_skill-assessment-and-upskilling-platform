import dotenv from "dotenv"
import axios from "axios"
import https from "https"

dotenv.config()

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT
const AZURE_OPENAI_MODEL_URL = process.env.AZURE_OPENAI_MODEL_URL
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY
const agent = https.Agent({ keepAlive: true })
const axiosInstance = axios.create({
    httpsAgent: agent,
    baseURL: `${AZURE_OPENAI_ENDPOINT}${AZURE_OPENAI_MODEL_URL}`,
    headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_API_KEY,
    },
})

class AzureAIService {
    async processOpenAIRequest(prompt, max_tokens) {
        const payload = await this.generatePayload(prompt, max_tokens) // Generate payload
        const response = await axiosInstance(payload) // Make Azure OpenAI API request
        return await this.formatOpenAIResponse(response.data.choices[0].message.content)  // Extract the content field
    }

    async formatOpenAIResponse(content) {
        const cleanContent = content.replace(/```json|```/g, "").trim() // Clean the content by removing ```json and ```
        return JSON.parse(cleanContent)
    }

    async generatePayload(prompt, max_tokens = 800) {
        return {
            method: 'POST',
            data: {
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                top_p: 0.95,
                max_tokens: max_tokens,
            },
        }
    }
}

export default new AzureAIService()