# 🎮 Emoji RPG

A voice-controlled text adventure game where emojis tell the story and your voice drives the action.

## Overview

Emoji RPG is an interactive role-playing game that combines the nostalgia of text adventures with modern voice technology. Speak your commands and watch as AI generates dynamic emoji-based scenes and adventures. Every playthrough is unique, powered by OpenAI's advanced language models.

## Features

- 🎤 **Voice Controls** - Speak your actions naturally
- 🎭 **Dynamic Storytelling** - AI-generated adventures that adapt to your choices
- 🎨 **Emoji Scenes** - Visual storytelling through carefully crafted emoji combinations
- 🔊 **Audio Feedback** - Text-to-speech responses bring the game to life
- 📱 **Cross-Platform** - Works on web, iOS, and Android
- 💾 **Game State Persistence** - Your adventures are saved automatically

## Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Audio** for voice recording and playback
- **AsyncStorage** for game persistence

### Backend
- **Node.js** with Express
- **OpenAI API** (Whisper, GPT-4, TTS)
- **TypeScript** throughout
- **Multer** for file handling

### AI Integration
- **Whisper API** - Speech-to-text transcription
- **GPT-4** - Dynamic game logic and story generation
- **TTS API** - Text-to-speech audio responses

## Project Structure

```
emoji-rpg/
├── app/                    # React Native Expo app
│   ├── src/
│   │   ├── services/       # API, audio, game state
│   │   └── types/          # TypeScript definitions
│   └── App.tsx            # Main game interface
├── server/                 # Node.js Express API
│   ├── src/
│   │   ├── services/       # OpenAI integration
│   │   └── routes/         # API endpoints
│   └── .env               # Environment variables
├── shared/                 # Shared TypeScript types
└── package.json           # Monorepo configuration
```

## Installation

### Prerequisites
- Node.js 18+ 
- npm 8+
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd emoji-rpg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create server/.env file
   echo "OPENAI_KEY=your-openai-api-key-here" > server/.env
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- **App**: http://localhost:8081 (Expo web)
- **Server**: http://localhost:3000 (Express API)

## Usage

1. **Open the game** in your browser at http://localhost:8081
2. **Click the microphone button** to start voice recording
3. **Speak your action** (e.g., "Go to the forest", "Fight the monster")
4. **Listen to the response** and see the emoji scene update
5. **Continue your adventure** by speaking new commands

### Text Fallback
If voice is unavailable, click the text action buttons to play without voice controls.

## Development

### Commands
```bash
npm run dev          # Start both app and server
npm run typecheck    # Run TypeScript validation
npm run build        # Build the server
```

### Adding Content
- Extend emoji vocabulary in `server/src/services/openai/gamemaster.ts`
- Add new game states in `shared/types.ts`
- Customize system prompts for different game styles

## License

MIT License - feel free to use this project as a foundation for your own voice-controlled games.

---

*Built with ❤️ using React Native, OpenAI, and lots of emojis*