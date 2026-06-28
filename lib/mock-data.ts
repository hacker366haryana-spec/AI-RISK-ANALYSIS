export type IntentType =
  | 'CHAT'
  | 'SEARCH'
  | 'SYSTEM'
  | 'CAMERA'
  | 'BROWSER'
  | 'MEDIA'
  | 'FILE'
  | 'UNKNOWN'

export type ServiceStatus = 'online' | 'degraded' | 'offline'

export interface IntentLog {
  id: string
  timestamp: Date
  transcript: string
  intent: IntentType
  command?: string
  result: string
  latencyMs: number
  status: 'success' | 'error' | 'pending'
  language: 'en' | 'hi' | 'hinglish'
}

export interface ConversationEntry {
  id: string
  timestamp: Date
  role: 'user' | 'hardik'
  text: string
  language: 'en' | 'hi' | 'hinglish'
}

export interface ServiceHealth {
  name: string
  key: string
  status: ServiceStatus
  latencyMs: number
  uptime: number
  lastChecked: Date
  description: string
}

export interface Permission {
  id: string
  name: string
  description: string
  granted: boolean
  sensitive: boolean
  category: 'hardware' | 'system' | 'network' | 'data'
}

// ---- Seed data ----

export const INITIAL_INTENTS: IntentLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 120_000),
    transcript: 'What is the current Bitcoin price?',
    intent: 'SEARCH',
    command: 'serp_search("bitcoin price")',
    result: 'Bitcoin is trading at $67,420 USD',
    latencyMs: 342,
    status: 'success',
    language: 'en',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 90_000),
    transcript: 'Open YouTube',
    intent: 'SYSTEM',
    command: 'open_youtube()',
    result: 'Launched YouTube in browser',
    latencyMs: 89,
    status: 'success',
    language: 'en',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 60_000),
    transcript: 'Bhai IPL ka score kya hai?',
    intent: 'SEARCH',
    command: 'serp_search("IPL live score")',
    result: 'CSK vs MI — CSK 187/4 in 18 overs',
    latencyMs: 410,
    status: 'success',
    language: 'hinglish',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 45_000),
    transcript: 'Start camera',
    intent: 'CAMERA',
    command: 'open_camera()',
    result: 'Permission requested — awaiting confirmation',
    latencyMs: 51,
    status: 'pending',
    language: 'en',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 20_000),
    transcript: 'Tell me about machine learning',
    intent: 'CHAT',
    command: 'gpt_chat("machine learning explanation")',
    result: 'Machine learning is a branch of AI that enables systems to learn...',
    latencyMs: 890,
    status: 'success',
    language: 'en',
  },
]

export const INITIAL_CONVERSATION: ConversationEntry[] = [
  {
    id: 'c1',
    timestamp: new Date(Date.now() - 300_000),
    role: 'user',
    text: 'Hey Hardik, what is the weather today?',
    language: 'en',
  },
  {
    id: 'c2',
    timestamp: new Date(Date.now() - 299_000),
    role: 'hardik',
    text: 'It is currently 32°C and sunny in your area. Humidity is at 68%. Expect clear skies throughout the day.',
    language: 'en',
  },
  {
    id: 'c3',
    timestamp: new Date(Date.now() - 200_000),
    role: 'user',
    text: 'Bhai latest AI news kya hai?',
    language: 'hinglish',
  },
  {
    id: 'c4',
    timestamp: new Date(Date.now() - 199_000),
    role: 'hardik',
    text: 'Bhai, aaj ki badi khabar yeh hai ki OpenAI ne GPT-5 ka announcement kiya hai. Saath hi Google ka Gemini Ultra 2.0 bhi launch hua. Kya aur detail chahiye?',
    language: 'hinglish',
  },
  {
    id: 'c5',
    timestamp: new Date(Date.now() - 120_000),
    role: 'user',
    text: 'What is the current Bitcoin price?',
    language: 'en',
  },
  {
    id: 'c6',
    timestamp: new Date(Date.now() - 119_000),
    role: 'hardik',
    text: 'Bitcoin is currently trading at $67,420 USD, up 2.4% in the last 24 hours. The market sentiment looks bullish.',
    language: 'en',
  },
  {
    id: 'c7',
    timestamp: new Date(Date.now() - 60_000),
    role: 'user',
    text: 'Tell me about machine learning',
    language: 'en',
  },
  {
    id: 'c8',
    timestamp: new Date(Date.now() - 59_000),
    role: 'hardik',
    text: 'Machine learning is a branch of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.',
    language: 'en',
  },
]

export const INITIAL_SERVICES: ServiceHealth[] = [
  {
    name: 'GPT-4o-mini',
    key: 'openai',
    status: 'online',
    latencyMs: 340,
    uptime: 99.8,
    lastChecked: new Date(),
    description: 'OpenAI language model for reasoning',
  },
  {
    name: 'ElevenLabs TTS',
    key: 'elevenlabs',
    status: 'online',
    latencyMs: 210,
    uptime: 99.2,
    lastChecked: new Date(),
    description: 'Streaming voice synthesis',
  },
  {
    name: 'SerpAPI',
    key: 'serpapi',
    status: 'degraded',
    latencyMs: 780,
    uptime: 97.1,
    lastChecked: new Date(),
    description: 'Google / YouTube search',
  },
  {
    name: 'Porcupine Wake',
    key: 'porcupine',
    status: 'online',
    latencyMs: 12,
    uptime: 100,
    lastChecked: new Date(),
    description: '"Hey Hardik" wake word detection',
  },
  {
    name: 'Whisper STT',
    key: 'whisper',
    status: 'online',
    latencyMs: 180,
    uptime: 99.5,
    lastChecked: new Date(),
    description: 'Multilingual speech-to-text',
  },
  {
    name: 'FastAPI Backend',
    key: 'backend',
    status: 'online',
    latencyMs: 8,
    uptime: 100,
    lastChecked: new Date(),
    description: 'Core WebSocket & REST API',
  },
]

export const INITIAL_PERMISSIONS: Permission[] = [
  {
    id: 'p1',
    name: 'Microphone',
    description: 'Continuous access for wake word and voice input',
    granted: true,
    sensitive: true,
    category: 'hardware',
  },
  {
    id: 'p2',
    name: 'Camera',
    description: 'Access for visual commands and face recognition',
    granted: false,
    sensitive: true,
    category: 'hardware',
  },
  {
    id: 'p3',
    name: 'Speaker / Audio Output',
    description: 'Streaming TTS playback via ElevenLabs',
    granted: true,
    sensitive: false,
    category: 'hardware',
  },
  {
    id: 'p4',
    name: 'System Control',
    description: 'Open/close applications, browser control',
    granted: true,
    sensitive: false,
    category: 'system',
  },
  {
    id: 'p5',
    name: 'File System',
    description: 'Read and write files in designated directories',
    granted: false,
    sensitive: true,
    category: 'system',
  },
  {
    id: 'p6',
    name: 'Network Requests',
    description: 'Internet access for SerpAPI, OpenAI, ElevenLabs',
    granted: true,
    sensitive: false,
    category: 'network',
  },
  {
    id: 'p7',
    name: 'Long-term Memory',
    description: 'Store user preferences and conversation facts',
    granted: true,
    sensitive: true,
    category: 'data',
  },
  {
    id: 'p8',
    name: 'WhatsApp Integration',
    description: 'Send and read WhatsApp messages via automation',
    granted: false,
    sensitive: true,
    category: 'network',
  },
]
