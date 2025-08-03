import { openai } from './client'
import fs from 'fs'
import path from 'path'
import os from 'os'

/**
 * Convert base64 audio string to temporary file for OpenAI Whisper API
 */
export async function base64ToAudioFile(base64Audio: string, filename = 'audio.webm'): Promise<string> {
  // Remove data URL prefix if present (e.g., "data:audio/webm;base64,")
  const cleanBase64 = base64Audio.split(',').pop() || base64Audio
  
  // Convert base64 to buffer
  const audioBuffer = Buffer.from(cleanBase64, 'base64')
  
  // Create temporary file path
  const tempDir = os.tmpdir()
  const tempFilePath = path.join(tempDir, `temp_audio_${Date.now()}_${filename}`)
  
  // Write buffer to temporary file
  await fs.promises.writeFile(tempFilePath, audioBuffer)
  
  return tempFilePath
}

/**
 * Clean up temporary audio file
 */
export async function cleanupAudioFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath)
  } catch (error) {
    console.warn('Failed to cleanup audio file:', error)
  }
}

/**
 * Transcribe audio to text using OpenAI Whisper API
 */
export async function transcribeAudio(base64Audio: string): Promise<string> {
  let tempFilePath: string | null = null
  
  try {
    // Convert base64 to temporary file
    tempFilePath = await base64ToAudioFile(base64Audio)
    
    // Create a readable stream from the file
    const fileStream = fs.createReadStream(tempFilePath)
    
    // Call Whisper API with file stream
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      language: 'en', // English language for the game
      response_format: 'text'
    })
    
    return transcription.trim()
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw new Error('Failed to transcribe audio')
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      await cleanupAudioFile(tempFilePath)
    }
  }
}

/**
 * Generate speech audio from text using OpenAI TTS API
 */
export async function generateSpeech(text: string): Promise<Buffer> {
  try {
    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
      response_format: 'mp3'
    })
    
    // Convert response to buffer
    const buffer = Buffer.from(await speech.arrayBuffer())
    return buffer
  } catch (error) {
    console.error('Error generating speech:', error)
    throw new Error('Failed to generate speech')
  }
}

/**
 * Detect audio format from base64 data
 */
export function detectAudioFormat(base64Audio: string): string {
  // Check for data URL prefix to detect format
  if (base64Audio.startsWith('data:audio/webm')) return 'audio/webm'
  if (base64Audio.startsWith('data:audio/mp3')) return 'audio/mp3'
  if (base64Audio.startsWith('data:audio/wav')) return 'audio/wav'
  if (base64Audio.startsWith('data:audio/m4a')) return 'audio/m4a'
  
  // Default to webm if no format detected
  return 'audio/webm'
}

/**
 * Validate audio file size (max 10MB as per PRP requirements)
 */
export function validateAudioSize(base64Audio: string, maxSizeMB = 10): boolean {
  const cleanBase64 = base64Audio.split(',').pop() || base64Audio
  const sizeInBytes = (cleanBase64.length * 3) / 4 // Approximate base64 to bytes conversion
  const sizeInMB = sizeInBytes / (1024 * 1024)
  
  return sizeInMB <= maxSizeMB
}