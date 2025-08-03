import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: '🎮 Emoji RPG Server is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Game route placeholder
app.post('/api/voice-action', (req, res) => {
  res.json({
    emojiScene: '🏠👤💰💰💰❤️❤️❤️',
    description: 'Si doma s 3 zlatými a plným zdravím.',
    options: ['⚔️ Bojovať', '🌲 Do lesa', '💤 Odpočinúť'],
    newGameState: 'home_full_health',
    ttsText: 'Vitaj v emoji RPG hre! Čo chceš robiť?'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🎮 Emoji RPG API ready!`)
})
