// Shared TypeScript types for Emoji RPG

/**
 * Game response interface - matches existing pattern from app/App.tsx
 */
export interface GameResponse {
  emojiScene: string
  description: string
  options: string[]
  newGameState: string
  ttsText: string
}

/**
 * Voice action request interface for API communication
 */
export interface VoiceActionRequest {
  action?: string              // Text action (fallback mode)
  audioData?: string           // Base64 encoded audio data
  gameState: string           // Current game state identifier
  audioFormat?: string        // Audio format (webm, mp3, wav, etc.)
}

/**
 * Voice action response interface (extends GameResponse with audio)
 */
export interface VoiceActionResponse extends GameResponse {
  audioData?: string          // Base64 encoded TTS audio response
  transcription?: string      // What was heard from user voice
  fallbackUsed?: boolean      // Whether fallback was used due to API failure
}

/**
 * Game state type - identifies current game scenario
 */
export type GameState = 
  | 'home_full_health'
  | 'home_injured'
  | 'forest_entrance'
  | 'forest_encounter'
  | 'combat_wolf'
  | 'combat_goblin'
  | 'treasure_found'
  | 'town_market'
  | 'town_tavern'
  | 'dungeon_entrance'
  | 'boss_fight'
  | 'game_over'
  | 'victory'

/**
 * Player stats interface for game progression
 */
export interface PlayerStats {
  health: number
  maxHealth: number
  gold: number
  experience: number
  level: number
  inventory: string[]         // Emoji-based items
}

/**
 * Game session interface for state management
 */
export interface GameSession {
  sessionId: string
  currentState: GameState
  playerStats: PlayerStats
  history: GameResponse[]
  startTime: Date
  lastUpdated: Date
}

/**
 * Error response interface for API errors
 */
export interface ErrorResponse {
  error: string
  details?: string
  fallback?: GameResponse     // Fallback response if available
}

/**
 * Audio configuration interface
 */
export interface AudioConfig {
  recordingFormat: 'webm' | 'mp3' | 'wav'
  maxDurationMs: number
  sampleRate: number
  bitRate: number
}

/**
 * API endpoints enum for type safety
 */
export enum ApiEndpoints {
  VOICE_ACTION = '/api/voice-action',
  GAME_STATE = '/api/game-state',
  HEALTH = '/health'
}

/**
 * Platform type for cross-platform audio handling
 */
export type Platform = 'web' | 'ios' | 'android'