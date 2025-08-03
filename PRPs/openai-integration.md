# PRP: OpenAI Integration for Voice-Controlled Emoji RPG

## Overview

Implement complete OpenAI integration in the Node.js Express server to power a voice-controlled emoji RPG game. This includes Speech-to-Text (Whisper), dynamic game logic generation (GPT-4), Text-to-Speech (TTS), and stateless game state management.

## Feature Requirements

### Core Features
1. **Voice-to-Text Processing**: Convert base64 audio from client to text actions using Whisper API
2. **Dynamic Game Logic**: Generate emoji scenes and responses using GPT-4 based on player actions
3. **Text-to-Speech**: Convert game responses to audio using OpenAI TTS API
4. **Game State Management**: Maintain consistent RPG world through system prompts (stateless server)

### Integration Points
- Replace static responses in `/api/voice-action` endpoint with dynamic OpenAI-powered gameplay
- Support both voice input and text fallback actions
- Maintain emoji-centric visual language throughout all responses
- Ensure consistent game world continuity across requests

## Current Codebase Context

### Existing Architecture (Working Foundation)
```typescript
// Current working endpoint at server/src/server.ts:30
app.post('/api/voice-action', (req, res) => {
  res.json({
    emojiScene: '🏠👤💰💰💰❤️❤️❤️',
    description: 'Si doma s 3 zlatými a plným zdravím.',
    options: ['⚔️ Bojovať', '🌲 Do lesa', '💤 Odpočinúť'],
    newGameState: 'home_full_health',
    ttsText: 'Vitaj v emoji RPG hre! Čo chceš robiť?'
  })
})
```

### App Integration Pattern (Established in app/App.tsx:32-65)
```typescript
const sendAction = async (action: string) => {
  setIsLoading(true)
  try {
    const response = await fetch('http://localhost:3000/api/voice-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: action,
        gameState: gameState.gameStateId
      })
    })
    const data: GameResponse = await response.json()
    // Updates UI state with response
  } catch (error) {
    Alert.alert('Chyba', 'Nepodarilo sa spojiť so serverom')
  }
}
```

### Dependencies Already Available
- **OpenAI SDK**: `openai: ^4.67.3` (server/package.json:25)
- **File Upload**: `multer: ^1.4.5` (server/package.json:24)
- **Audio Recording**: `expo-audio: ~0.4.8` (app/package.json:25)
- **Environment**: `OPENAI_KEY` already configured (server/.env)

## Implementation Context & Patterns

### Follow Existing Code Conventions

1. **No Semicolons Policy** (Enforced by Prettier - CLAUDE.md:54)
   ```typescript
   // ✅ Correct - no semicolons
   const transcription = await openai.audio.transcriptions.create({
     file: audioFile,
     model: 'whisper-1'
   })
   
   // ❌ Wrong - has semicolons
   const transcription = await openai.audio.transcriptions.create({
     file: audioFile,
     model: 'whisper-1'
   });
   ```

2. **Error Handling Pattern** (From server/src/server.ts:40-44)
   ```typescript
   app.post('/route', (req, res) => {
     (async () => {
       try {
         // Implementation here
         res.send(output)
       } catch (err) {
         res.status(400).send(JSON.stringify({ error: err.message }))
       }
     })().catch((err) => {
       res.status(500).send(err.toString())
     })
   })
   ```

3. **TypeScript Interfaces** (From app/App.tsx:13-19)
   ```typescript
   interface GameResponse {
     emojiScene: string
     description: string
     options: string[]
     newGameState: string
     ttsText: string
   }
   ```

### Audio Processing Pattern (From feature examples)
```typescript
// Base64 audio handling (useAudioRecording.ts pattern)
const audioB64 = await FileSystem.readAsStringAsync(finalUri, {
  encoding: FileSystem.EncodingType.Base64,
})

// Web audio handling
const reader = new FileReader()
reader.onloadend = () => {
  const base64String = reader.result as string
  const base64Audio = base64String.split(',')[1]
}
```

### OpenAI Integration Patterns (From feature examples)
```typescript
// Whisper transcription
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
})

// GPT completion
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'System prompt here' },
    { role: 'user', content: userInput }
  ]
})

// TTS generation  
const speech = await openai.audio.speech.create({
  model: 'tts-1',
  voice: 'alloy',
  input: text,
})
```

## Critical Implementation Details

### Environment Setup (server/.env pattern)
```bash
OPENAI_KEY=sk-proj-... # Already configured
```

### OpenAI Client Initialization
```typescript
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.OPENAI_KEY) {
  throw new Error('OPENAI_KEY environment variable is required')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
})
```

### Key Gotchas & Constraints

1. **File Object Creation for Whisper**
   ```typescript
   // ✅ Correct way to create File for Whisper API
   const audioBuffer = Buffer.from(base64Audio, 'base64')
   const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' })
   ```

2. **Game Logic Constraints**
   - **Stateless server**: Game state passed with each request, never stored
   - **Bounded creativity**: System prompts prevent AI from breaking character
   - **Emoji consistency**: Establish emoji vocabulary for visual representation
   - **Fallback responses**: Always have backup if OpenAI API fails

3. **Audio Format Handling**
   - Support webm, mp3, wav for Whisper
   - TTS returns binary audio data requiring proper Content-Type headers
   - Handle both native and web audio encoding differences

4. **Rate Limiting & Performance**
   - Add delays between API calls to avoid rate limits
   - Monitor token usage for long conversations
   - Clean up audio buffers after processing

## System Prompts for Game Consistency

### Core Game Master Prompt
```
You are the Game Master for an emoji-based RPG adventure. 

RULES:
- Always respond with emoji scenes (6-12 emojis representing the current scenario)
- Maintain consistent game world and character progression
- Allow creative player actions while preventing impossible/game-breaking moves
- Generate 2-4 action options as emoji + text combinations
- Keep descriptions concise and engaging (1-2 sentences max)
- Current game state will be provided - maintain continuity

RESPONSE FORMAT:
- emojiScene: String of 6-12 emojis representing current scenario
- description: Brief description in Slovak (1-2 sentences)
- options: Array of 2-4 possible actions (emoji + text)
- newGameState: New state identifier for continuity
- ttsText: Same as description, optimized for text-to-speech

EMOJI VOCABULARY:
- 👤 = Player character
- ❤️ = Health points
- 💰 = Gold/currency
- 🏠 = Home/safe area
- 🌲 = Forest/wilderness
- ⚔️ = Combat/weapon
- 🛡️ = Defense/armor
- 🔮 = Magic/mystical
- 👹 = Enemy/monster
- 🎒 = Inventory/items
```

## Implementation Tasks (Execution Order)

### Phase 1: Core OpenAI Integration
1. **Create OpenAI service** (`server/src/services/openai/client.ts`)
   - Initialize OpenAI client with environment validation
   - Export configured client for use across services

2. **Audio processing service** (`server/src/services/openai/audio.ts`)
   - Whisper transcription function
   - TTS generation function
   - Base64 to File conversion utilities

3. **Game logic service** (`server/src/services/openai/gamemaster.ts`)
   - GPT-4 game master implementation
   - System prompt management
   - Response formatting and validation

### Phase 2: API Integration
4. **Update shared types** (`shared/types.ts`)
   - Define VoiceActionRequest interface
   - Define GameResponse interface (extend existing)
   - Define GameState type

5. **Enhance voice-action endpoint** (`server/src/server.ts`)
   - Replace static response with OpenAI integration
   - Add audio processing middleware
   - Implement error handling and fallbacks

### Phase 3: Audio Enhancement (App Side)
6. **Voice recording implementation** (`app/src/services/audio/recorder.ts`)
   - Expo Audio recording setup
   - Base64 encoding for API transmission
   - Web/native platform handling

7. **Audio playback service** (`app/src/services/audio/player.ts`)
   - TTS audio playback
   - Platform-specific audio handling

### Phase 4: Integration & Testing
8. **Update app API client** (`app/src/services/api/client.ts`)
   - Add voice action with audio support
   - Error handling for audio processing
   - Fallback to text-only mode

9. **Game state management** (`app/src/services/game/state.ts`)
   - Enhanced game state tracking
   - Game history management
   - Persistence layer (optional)

## Validation Gates (Must Pass)

### Code Quality
```bash
# TypeScript validation
npm run typecheck

# Linting (no semicolons enforcement)
npm run lint

# Formatting verification
npm run format
```

### Functional Testing
1. **Audio Pipeline Test**: Record → Transcribe → Process → Respond → TTS
2. **Text Fallback Test**: Direct text input should work when audio fails
3. **Game Continuity Test**: State persistence across multiple interactions
4. **Error Handling Test**: Graceful degradation when OpenAI API unavailable

### Integration Requirements
- Voice recording works in both web and native environments
- Audio playback functions across platforms
- Game state maintains consistency across sessions
- API responses follow established interface contracts

## Documentation References

### OpenAI API Documentation
- **Whisper API**: https://platform.openai.com/docs/guides/speech-to-text
- **Chat Completions**: https://platform.openai.com/docs/guides/text-generation
- **Text-to-Speech**: https://platform.openai.com/docs/guides/text-to-speech
- **Function Calling**: https://platform.openai.com/docs/guides/function-calling

### React Native Audio
- **Expo Audio**: https://docs.expo.dev/versions/latest/sdk/audio/
- **Platform Differences**: https://docs.expo.dev/guides/using-expo-web/

### Express.js Integration
- **Multer File Upload**: https://github.com/expressjs/multer
- **Error Handling**: https://expressjs.com/en/guide/error-handling.html
- **CORS Setup**: https://github.com/expressjs/cors

## Risk Mitigation

### API Failure Handling
- Always provide fallback static responses if OpenAI unavailable
- Implement request timeout and retry logic
- Cache common game scenarios to reduce API calls

### Performance Considerations
- Limit audio file size to prevent abuse (max 10MB)
- Implement request queuing for concurrent users
- Add response time monitoring

### Security & Privacy
- Validate all audio input before processing
- Don't log sensitive user audio data
- Rate limit requests per IP to prevent abuse

## Success Criteria

### Primary Goals
✅ Voice input successfully transcribed to game actions  
✅ Dynamic emoji scenes generated based on player actions  
✅ Audio responses played back to user  
✅ Game state maintains continuity across interactions  

### Secondary Goals  
✅ Graceful fallback to text-only mode when voice unavailable  
✅ Consistent emoji vocabulary throughout game experience  
✅ Sub-3-second response time for typical interactions  
✅ Error handling prevents app crashes during API failures  

## Implementation Confidence Score: 9/10

**Rationale**: Comprehensive context provided with existing working patterns, established dependencies, clear API documentation, and specific implementation examples. The only challenge is managing OpenAI API rate limits and ensuring robust error handling, but these are well-documented concerns with established solutions.

---

**Ready for one-pass implementation using Claude Code**