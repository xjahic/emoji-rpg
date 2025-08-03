import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'

// Import shared types
import { VoiceActionRequest, VoiceActionResponse } from '@shared/types'

// Import OpenAI services
import { transcribeAudio, generateSpeech, validateAudioSize } from './services/openai/audio'
import { generateGameResponse, getFallbackResponse, getInitialGameState } from './services/openai/gamemaster'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Configure multer for file uploads (if needed for future file-based audio)
const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  storage: multer.memoryStorage()
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' })) // Increase limit for base64 audio

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

// Enhanced voice-action endpoint with OpenAI integration
app.post('/api/voice-action', (req, res) => {
  (async () => {
    try {
      const request: VoiceActionRequest = req.body
      let playerAction: string
      let transcription: string | undefined
      let fallbackUsed = false

      // Validate required fields
      if (!request.gameState) {
        return res.status(400).json({ error: 'gameState is required' })
      }

      // Handle initial game state
      if (request.gameState === 'initial' || request.gameState === 'new_game') {
        const initialState = getInitialGameState()
        let audioData: string | undefined

        try {
          const audioBuffer = await generateSpeech(initialState.ttsText)
          audioData = audioBuffer.toString('base64')
        } catch (audioError) {
          console.warn('TTS generation failed for initial state:', audioError)
        }

        const response: VoiceActionResponse = {
          ...initialState,
          audioData,
          transcription: undefined,
          fallbackUsed: false
        }

        return res.json(response)
      }

      // Process audio or text input
      if (request.audioData) {
        try {
          // Validate audio size
          if (!validateAudioSize(request.audioData)) {
            return res.status(400).json({ error: 'Audio file too large (max 10MB)' })
          }

          // Transcribe audio to text
          transcription = await transcribeAudio(request.audioData)
          playerAction = transcription
          
          if (!playerAction || playerAction.trim().length === 0) {
            throw new Error('Empty transcription')
          }
        } catch (audioError) {
          console.warn('Audio processing failed:', audioError)
          
          // Fallback to text action if provided
          if (request.action) {
            playerAction = request.action
            fallbackUsed = true
          } else {
            return res.status(400).json({ 
              error: 'Failed to process audio and no text fallback provided',
              details: audioError instanceof Error ? audioError.message : 'Unknown audio error'
            })
          }
        }
      } else if (request.action) {
        // Use text action directly
        playerAction = request.action
      } else {
        return res.status(400).json({ error: 'Either audioData or action must be provided' })
      }

      // Generate game response using OpenAI
      let gameResponse
      try {
        gameResponse = await generateGameResponse(playerAction, request.gameState)
      } catch (gameError) {
        console.warn('Game generation failed, using fallback:', gameError)
        gameResponse = getFallbackResponse(request.gameState)
        fallbackUsed = true
      }

      // Generate TTS audio for response
      let audioData: string | undefined
      try {
        const audioBuffer = await generateSpeech(gameResponse.ttsText)
        audioData = audioBuffer.toString('base64')
      } catch (ttsError) {
        console.warn('TTS generation failed:', ttsError)
        // Continue without audio - not critical
      }

      // Prepare final response
      const response: VoiceActionResponse = {
        ...gameResponse,
        audioData,
        transcription,
        fallbackUsed
      }

      res.json(response)
    } catch (error) {
      console.error('Voice action error:', error)
      
      // Provide fallback response even on server error
      try {
        const fallback = getFallbackResponse(req.body.gameState || 'home_full_health')
        const response: VoiceActionResponse = {
          ...fallback,
          fallbackUsed: true,
          transcription: undefined
        }
        res.status(500).json(response)
      } catch (fallbackError) {
        res.status(500).json({ 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  })().catch((err) => {
    console.error('Unhandled voice action error:', err)
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.toString()
    })
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🎮 Emoji RPG API ready!`)
})
