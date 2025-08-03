import { openai } from './client'

// System prompt for consistent game master behavior (from PRP)
const GAME_MASTER_PROMPT = `You are the Game Master for an emoji-based RPG adventure. 

RULES:
- Always respond with emoji scenes (6-12 emojis representing the current scenario)
- Maintain consistent game world and character progression
- Allow creative player actions while preventing impossible/game-breaking moves
- Generate 2-4 action options as emoji + text combinations
- Keep descriptions concise and engaging (1-2 sentences max)
- Current game state will be provided - maintain continuity

RESPONSE FORMAT:
You must respond with a valid JSON object containing exactly these fields:
{
  "emojiScene": "String of 6-12 emojis representing current scenario",
  "description": "Brief description in English (1-2 sentences)",
  "options": ["Array of 2-4 possible actions (emoji + text)"],
  "newGameState": "New state identifier for continuity",
  "ttsText": "Same as description, optimized for text-to-speech"
}

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

Always maintain game state continuity and respond only with valid JSON.`

export interface GameResponse {
  emojiScene: string
  description: string
  options: string[]
  newGameState: string
  ttsText: string
}

/**
 * Generate game response based on player action and current game state
 */
export async function generateGameResponse(
  playerAction: string,
  currentGameState: string
): Promise<GameResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: GAME_MASTER_PROMPT
        },
        {
          role: 'user',
          content: `Player action: "${playerAction}"
Current game state: "${currentGameState}"

Generate the next scene based on this action.`
        }
      ],
      temperature: 0.8, // Some creativity but controlled
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse and validate the JSON response
    const gameResponse: GameResponse = JSON.parse(response)
    
    // Validate required fields
    if (!gameResponse.emojiScene || !gameResponse.description || 
        !gameResponse.options || !gameResponse.newGameState || 
        !gameResponse.ttsText) {
      throw new Error('Invalid game response format')
    }

    // Validate emoji scene length (6-12 emojis)
    const emojiCount = [...gameResponse.emojiScene].length
    if (emojiCount < 6 || emojiCount > 12) {
      console.warn(`Emoji scene length (${emojiCount}) outside recommended range (6-12)`)
    }

    // Validate options count (2-4)
    if (gameResponse.options.length < 2 || gameResponse.options.length > 4) {
      console.warn(`Options count (${gameResponse.options.length}) outside recommended range (2-4)`)
    }

    return gameResponse
  } catch (error) {
    console.error('Error generating game response:', error)
    throw new Error('Failed to generate game response')
  }
}

/**
 * Get fallback response when OpenAI API fails
 */
export function getFallbackResponse(currentGameState: string): GameResponse {
  // Provide different fallbacks based on current state
  const fallbacks: Record<string, GameResponse> = {
    home_full_health: {
      emojiScene: '🏠👤💰💰💰❤️❤️❤️',
      description: 'You are home with 3 gold and full health. What do you want to do?',
      options: ['⚔️ Fight', '🌲 Forest', '💤 Rest'],
      newGameState: 'home_full_health',
      ttsText: 'You are home with full health. What do you want to do?'
    },
    forest_encounter: {
      emojiScene: '🌲🌲👤🐺👹🌲🌲',
      description: 'In the forest you encounter an enemy! Prepare for battle.',
      options: ['⚔️ Attack', '🛡️ Defend', '🏃 Flee'],
      newGameState: 'combat_wolf',
      ttsText: 'In the forest you encounter an enemy! Prepare for battle.'
    }
  }

  return fallbacks[currentGameState] || fallbacks.home_full_health
}

/**
 * Initialize new game session
 */
export function getInitialGameState(): GameResponse {
  return {
    emojiScene: '🏠👤💰💰💰❤️❤️❤️',
    description: 'Welcome to Emoji RPG! You are home with 3 gold and full health.',
    options: ['⚔️ Fight', '🌲 Forest', '💤 Rest'],
    newGameState: 'home_full_health',
    ttsText: 'Welcome to emoji RPG game! You are home with full health. What do you want to do?'
  }
}