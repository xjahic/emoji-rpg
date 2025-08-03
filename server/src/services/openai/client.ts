import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Validate required environment variables
if (!process.env.OPENAI_KEY) {
  throw new Error('OPENAI_KEY environment variable is required')
}

// Initialize OpenAI client with API key
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
})

// Export configured client as default
export default openai