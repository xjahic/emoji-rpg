# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emoji RPG is a voice-controlled text adventure game built as a React Native monorepo. The project consists of a React Native Expo app for the frontend and a Node.js Express server with OpenAI integration for the backend. The game uses emojis as the primary visual language and voice commands for interaction.

## Claude Code Usage Guidelines

**DO NOT run development commands** - the user will handle running the application. Only run `npm run typecheck` when making code changes.

### Available Commands (for reference only)

```bash
# Code Quality (ONLY commands Claude should run)
npm run typecheck         # Run TypeScript checks - RUN AFTER CODE CHANGES
npm run format           # Format code with Prettier (no semicolons)

# Development (USER handles these)
npm run dev              # Start both server and app (concurrently)
npm run server:dev       # Start Express server only (port 3000)
npm run app:web          # Start Expo web only (port 8081)
npm run app:android      # Run on Android device/emulator
npm run app:ios          # Run on iOS device/simulator
```

**CRITICAL**: All code must pass `npm run typecheck` before committing. Always run this after making code changes.

## Monorepo Architecture

### Structure

```
emoji-rpg/
├── app/                 # React Native Expo application
│   ├── src/
│   ├── package.json
│   └── App.tsx
├── server/              # Node.js Express API
│   ├── src/
│   ├── package.json
│   └── .env (contains OPENAI_API_KEY)
├── shared/              # Shared TypeScript types
│   └── types.ts
└── package.json         # Root monorepo management
```

### API Integration Pattern

- **RESTful API** between app and server
- **OpenAI integration** for game logic:
  ```typescript
  // Whisper for speech-to-text
  const transcription = await openai.audio.transcriptions.create()
  
  // GPT for game responses
  const response = await openai.chat.completions.create()
  
  // TTS for voice output
  const speech = await openai.audio.speech.create()
  ```
- **Shared types** for API contracts in `/shared/types.ts`

### Game State Management

- **Simple local state** with React hooks (useState)
- **Game state** represented as emoji strings + metadata
- **Voice recording** with Expo Audio
- **Real-time communication** between app and server

## Development Guidelines

### Component Placement (App)

- **Screen components**: `app/src/screens/ScreenName/`
- **Shared components**: `app/src/components/component-category/`
- **Services**: `app/src/services/` (api, audio, game)
- **Types**: `app/src/types/`

### Server Structure

- **Routes**: `server/src/routes/`
- **Services**: `server/src/services/` (openai, game)
- **Middleware**: `server/src/middleware/`
- **Types**: `server/src/types/`

### Code Standards

- **TypeScript strict mode** enabled
- **No semicolons** - enforced by Prettier
- **Single quotes** for strings
- **2 spaces** indentation
- **Function structure**: Use regular functions at the end of React components
  ```tsx
  // ✅ Correct - regular functions at component end
  export default function GameScreen() {
    const [gameState, setGameState] = useState()
    
    return <View><TouchableOpacity onPress={handleAction} /></View>
    
    function handleAction(): void {
      // handler implementation
    }
  }
  ```
- **Naming conventions**:
  - Functions: verbs (sendAction, recordVoice, generateScene)
  - Booleans: is/are prefix (isLoading, isRecording)
  - Game states: descriptive (home_full_health, forest_encounter)
  - API endpoints: RESTful (/api/voice-action, /api/game-state)

### Game-Specific Patterns

- **Emoji scenes**: Primary visual representation
- **Voice-first interaction**: Voice commands preferred over buttons
- **Fallback UI**: Text buttons when voice unavailable
- **Minimalist design**: Focus on emojis and essential text
- **Dark theme**: Gaming aesthetic with emoji highlighting

### Platform Support

- **Primary**: Web browser (development target)
- **Secondary**: Android, iOS for voice features
- **Voice features**: May need fallbacks on web
- **Responsive design**: Support 360px mobile to desktop

### OpenAI Integration

- **Environment variables**: Store API keys in `server/.env`
- **Error handling**: Graceful fallbacks for API failures
- **Rate limiting**: Consider OpenAI API limits
- **Prompt engineering**: Maintain consistent game world
- **Audio processing**: Base64 encoding for voice data

## Git Workflow

- **Primary branch**: `main`
- **Feature branches**: `feature/voice-recording`, `feature/openai-integration`
- **No semicolons policy**: Enforced by Prettier configuration
- **Commit messages**: Use conventional commits format

## Environment Configuration

### Development Setup

- **App**: Expo web on `http://localhost:8081`
- **Server**: Express on `http://localhost:3000`
- **API**: OpenAI API key required in `server/.env`
- **CORS**: Enabled for local development

### Key Dependencies

#### App
- **React Native 0.79.5** with Expo 53.0.8
- **Expo Audio** for voice recording
- **React Navigation** for navigation
- **Zustand** for simple state management
- **TypeScript** strict mode

#### Server
- **Express.js** with TypeScript
- **OpenAI SDK** for GPT, Whisper, TTS
- **Multer** for file uploads
- **CORS** for cross-origin requests
- **dotenv** for environment variables

## OpenAI Integration Implementation (COMPLETED)

### ✅ Current Status - FULLY FUNCTIONAL
The complete OpenAI integration has been implemented and is working. All features are operational:

- **Voice-to-Text**: Whisper API with Node.js file handling ✅
- **Dynamic Game Logic**: GPT-4 powered responses with system prompts ✅  
- **Text-to-Speech**: OpenAI TTS with cross-platform audio playback ✅
- **Game State Management**: Stateless server with continuity ✅
- **Error Handling**: Comprehensive fallbacks and retry logic ✅

### Architecture Overview

```
Voice Input → Base64 → Server → Temp File → Whisper API → GPT-4 → TTS → Audio Response
```

### Key Implementation Files

#### Server Services (`server/src/services/openai/`)
- **`client.ts`**: OpenAI SDK initialization with API key validation
- **`audio.ts`**: Whisper transcription & TTS generation (Node.js compatible)
- **`gamemaster.ts`**: GPT-4 game logic with system prompts

#### App Services (`app/src/services/`)
- **`audio/recorder.ts`**: Cross-platform voice recording (provided by user)
- **`audio/player.ts`**: TTS audio playback for web/mobile
- **`api/client.ts`**: Enhanced API client with retry logic and fallbacks
- **`game/state.ts`**: Game session management with AsyncStorage persistence

#### Types (`app/src/types/shared.ts`)
- **Local copy** of shared types (fixes web bundling issues)
- **VoiceActionRequest/Response**: API contracts
- **GameState, PlayerStats**: Game progression tracking

### Critical Implementation Details

#### Audio Processing (Node.js Fix Applied)
```typescript
// ✅ WORKING: Node.js compatible file handling
const tempFilePath = await base64ToAudioFile(base64Audio)
const fileStream = fs.createReadStream(tempFilePath)
const transcription = await openai.audio.transcriptions.create({
  file: fileStream,
  model: 'whisper-1'
})
// Auto-cleanup temporary files
```

#### Game Master System Prompt
```typescript
const GAME_MASTER_PROMPT = `
You are the Game Master for an emoji-based RPG adventure.
- Always respond with emoji scenes (6-12 emojis)
- Maintain consistent game world and character progression
- Generate 2-4 action options as emoji + text combinations
- Keep descriptions concise in English (1-2 sentences max)
- Response format: JSON with emojiScene, description, options, newGameState, ttsText
`
```

#### Voice-Action API Endpoint
```typescript
app.post('/api/voice-action', async (req, res) => {
  // 1. Validate input (audioData OR action + gameState required)
  // 2. Transcribe audio if provided (with fallback to text)
  // 3. Generate game response using GPT-4
  // 4. Create TTS audio response
  // 5. Return structured response with fallback handling
})
```

### Game Flow Implementation

1. **Initial State**: App fetches initial game state on mount
2. **Voice Input**: User records voice → base64 → server
3. **Processing**: Server transcribes → processes with GPT → generates TTS
4. **Response**: JSON with emoji scene, description, options, audio data
5. **Display**: App updates UI and plays TTS audio
6. **Continuity**: Game state passed with each request for consistency

### Error Handling & Fallbacks

- **Audio Processing Fails**: Fallback to text action if provided
- **OpenAI API Fails**: Predefined fallback responses maintain gameplay
- **Network Issues**: Retry logic with exponential backoff
- **Invalid Responses**: Response validation with fallback generation

### Platform-Specific Implementations

#### Web Audio Handling
```typescript
// Web: MediaRecorder API → Blob → base64
const mediaRecorder = new MediaRecorder(stream)
mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data)
```

#### Mobile Audio Handling  
```typescript
// Mobile: Expo Audio → FileSystem → base64
const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: 'Base64' })
```

### Performance Optimizations

- **Temporary File Cleanup**: Auto-cleanup prevents disk space issues
- **Audio Size Validation**: 10MB limit prevents abuse
- **Request Timeouts**: 10-second timeout with retry logic
- **Response Caching**: Fallback responses cached for offline scenarios

### Development Patterns Established

#### Import Structure
```typescript
// ✅ Use local types (fixes web bundling)
import { VoiceActionResponse } from '../../types/shared'

// ✅ Service imports
import { useAudioRecording } from './src/services/audio/recorder'
import { sendTextAction, sendAudioAction } from './src/services/api/client'
```

#### Error Handling Pattern
```typescript
// ✅ Consistent async/await with fallbacks
try {
  const response = await openaiCall()
  return response
} catch (error) {
  console.warn('Primary failed, using fallback:', error)
  return getFallbackResponse()
}
```

### Next Steps / Enhancement Opportunities

1. **Game Content**: Expand emoji vocabulary and scenarios
2. **State Persistence**: Enhanced save/load game sessions  
3. **Performance**: Response streaming for long interactions
4. **Analytics**: Track usage patterns and popular actions
5. **Multilingual**: Extend beyond English if needed

### Debugging Notes

- **File API Error**: Fixed by replacing web `File` with Node.js file streams
- **Import Path Issues**: Resolved by copying shared types locally
- **TypeScript Paths**: Server uses path mapping, app uses relative imports
- **Audio Format Support**: Handles webm, mp3, wav across platforms

### Environment Requirements

```bash
# Server .env (REQUIRED)
OPENAI_KEY=sk-proj-... # Must be valid OpenAI API key

# Development
npm run typecheck  # Always run after changes
npm run dev       # Starts both server (3000) and app (8081)
```

## Development Guidelines

### Component Placement (App)

- **Screen components**: `app/src/screens/ScreenName/`
- **Shared components**: `app/src/components/component-category/`
- **Services**: `app/src/services/` (api, audio, game)
- **Types**: `app/src/types/` (local copy of shared types)

### Server Structure

- **Routes**: `server/src/routes/`
- **Services**: `server/src/services/` (openai, game)
- **Middleware**: `server/src/middleware/`
- **Types**: Use `@shared/types` path mapping

### Code Standards

- **TypeScript strict mode** enabled
- **No semicolons** - enforced by Prettier
- **Single quotes** for strings
- **2 spaces** indentation
- **English language** throughout (prompts, UI, responses)
- **Function structure**: Use regular functions at the end of React components
  ```tsx
  // ✅ Correct - regular functions at component end
  export default function GameScreen() {
    const [gameState, setGameState] = useState()
    
    return <View><TouchableOpacity onPress={handleAction} /></View>
    
    function handleAction(): void {
      // handler implementation
    }
  }
  ```
- **Naming conventions**:
  - Functions: verbs (sendAction, recordVoice, generateScene)
  - Booleans: is/are prefix (isLoading, isRecording)
  - Game states: descriptive (home_full_health, forest_encounter)
  - API endpoints: RESTful (/api/voice-action, /api/game-state)

### Game-Specific Patterns

- **Emoji scenes**: Primary visual representation (6-12 emojis per scene)
- **Voice-first interaction**: Voice commands preferred over buttons
- **Fallback UI**: Text buttons when voice unavailable
- **Minimalist design**: Focus on emojis and essential text
- **Dark theme**: Gaming aesthetic with emoji highlighting
- **English responses**: All game content in English

### Platform Support

- **Primary**: Web browser (development target)
- **Secondary**: Android, iOS for voice features
- **Voice features**: Cross-platform with graceful fallbacks
- **Responsive design**: Support 360px mobile to desktop

## Weekend Project Focus

- **MVP achieved**: All core features working and tested
- **Production ready**: Error handling and fallbacks implemented
- **Voice-optional**: Text buttons work when voice unavailable
- **Extensible**: Easy to add new game scenarios and features