## FEATURE: OpenAI Integration for Voice-Controlled Emoji RPG

Implement complete OpenAI integration in the Node.js server to handle:
1. **Speech-to-Text** (Whisper API) - Convert voice input to text actions
2. **Game Logic Generation** (GPT-4) - Generate dynamic emoji scenes and responses  
3. **Text-to-Speech** (TTS API) - Convert responses back to audio
4. **Game State Management** - Maintain consistent RPG world through prompts

The server should replace static responses with dynamic OpenAI-powered gameplay that maintains consistency while allowing creative player actions.

## EXAMPLES:

### Voice Processing Pipeline (from useAudioRecording.ts)
```typescript
// Base64 audio handling pattern from existing codebase
const audioB64 = await FileSystem.readAsStringAsync(finalUri, {
  encoding: FileSystem.EncodingType.Base64,
})

// Web audio handling
const reader = new FileReader()
reader.onloadend = () => {
  const base64String = reader.result as string
  const base64Audio = base64String.split(',')[1]
}
reader.readAsDataURL(audioBlob)
```

### OpenAI Tool-Based Agent Pattern (from server_agent.ts)
```typescript
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  { type: 'function', function: {
    name: 'get_credit',
    description: 'Získa výšku kreditu pre telefónne číslo.',
    parameters: {
      type: 'object',
      properties: {
        msisdn: { type: ['string', 'null'] },
      },
      required: ['msisdn'],
    },
  }},
]

// Tool execution loop
let completion = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  tools,
  messages,
})

while (completion.choices[0].message.tool_calls?.length) {
  for (let toolCall of completion.choices[0].message.tool_calls) {
    let resp = await toolHandlers[toolCall.function.name](context, JSON.parse(toolCall.function.arguments))
    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: resp,
    })
  }
  completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    tools,
    messages,
  })
}
```

### Audio API Integration Pattern (from existing code)
```typescript
// Whisper transcription
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
})

// TTS generation  
const speech = await openai.audio.speech.create({
  model: 'tts-1',
  voice: 'alloy',
  input: text,
})
```

### Express Route Pattern (from ai_agent_server.ts)
```typescript
app.post('/ai-agent', (req, resp) => {
  (async () => {
    try {
      let output = await handleAgentResponse({
        meData,
        appState: req.body.appState,
        messages: req.body.messages,
        auth: req.headers.authorization!,
      })
      resp.send(output)
    } catch (err) {
      resp.status(400).send(JSON.stringify({ agentError: err.message }))
    }
  })().catch((err) => {
    resp.status(500).send(err.toString())
  })
})
```

## DOCUMENTATION:

### OpenAI SDK Documentation
- **Main SDK**: https://github.com/openai/openai-node
- **Whisper API**: https://platform.openai.com/docs/guides/speech-to-text
- **Chat Completions**: https://platform.openai.com/docs/guides/text-generation  
- **Text-to-Speech**: https://platform.openai.com/docs/guides/text-to-speech
- **Function Calling**: https://platform.openai.com/docs/guides/function-calling

### Emoji RPG Game Design Patterns
- **Prompt Engineering**: https://platform.openai.com/docs/guides/prompt-engineering
- **System Prompts**: https://cookbook.openai.com/examples/how_to_use_system_messages
- **Consistent Character**: https://cookbook.openai.com/examples/how_to_build_a_tool_using_gpt3

### Express.js with OpenAI
- **File Upload Handling**: https://github.com/expressjs/multer
- **Error Handling Middleware**: https://expressjs.com/en/guide/error-handling.html
- **CORS Setup**: https://github.com/expressjs/cors

## OTHER CONSIDERATIONS:

### Critical Implementation Patterns
1. **Follow existing toolHandler pattern** - Use the same structure as in server_agent.ts for RPG game functions
2. **No semicolons policy** - All code must follow the project's Prettier configuration
3. **Error handling wrapper** - Use the same async/catch pattern from ai_agent_server.ts
4. **Base64 audio processing** - Handle audio exactly like useAudioRecording.ts (support both web and native)
5. **TypeScript strict mode** - All interfaces must be properly typed

### OpenAI-Specific Gotchas
- **File object creation**: Use `new File([buffer], 'audio.webm', { type: 'audio/webm' })` for Whisper API
- **Rate limiting**: Add proper delays between API calls to avoid rate limits  
- **Token management**: Monitor token usage for long conversations
- **Audio format**: Whisper supports webm, mp3, wav - handle format conversion if needed
- **TTS response**: Returns binary audio data, needs proper Content-Type headers

### Game Logic Constraints  
- **Bounded creativity**: System prompts must prevent AI from "breaking character"
- **State persistence**: Game state must be passed with each request (stateless server)
- **Emoji consistency**: Establish emoji "vocabulary" for consistent visual representation
- **Fallback responses**: Always have backup responses if OpenAI API fails
- **Action validation**: Prevent impossible actions while allowing creativity

### Environment & Security
- **API Key management**: Use dotenv exactly like existing pattern, fail fast if missing
- **CORS configuration**: Copy CORS setup from ai_agent_server.ts exactly
- **Request validation**: Validate all incoming audio/text data before processing
- **File size limits**: Limit audio upload size to prevent abuse

### Performance Considerations
- **Streaming responses**: Consider implementing streaming for long GPT responses
- **Async processing**: All OpenAI calls must be properly async/await
- **Memory management**: Clean up audio buffers after processing
- **Caching**: Consider caching common game responses to reduce API calls

### Testing Strategy
- **Mock OpenAI calls** during development to avoid burning API credits
- **Audio format testing** across web/mobile platforms
- **Error scenario testing** (API failures, malformed audio, etc.)
- **Game state validation** ensure consistency across sessions

### Integration Points
- **Existing server.ts**: Extend the current basic server, don't replace
- **App.tsx integration**: Current fetch calls should work with new endpoints
- **Shared types**: Create proper TypeScript interfaces in /shared folder
- **Voice recording**: Integration with existing useAudioRecording pattern (though this file doesn't exist yet in our project)