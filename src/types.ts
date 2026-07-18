export interface User {
  name: string;
  registeredAt: string;
}

export type ApiProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface ApiKeyConfig {
  id: string;
  provider: ApiProvider;
  label: string;
  apiKey: string;
  customEndpoint?: string;
  modelName: string;
  isActive: boolean;
  status: 'active' | 'error' | 'testing' | 'untested';
  lastError?: string;
  usageCount: number;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  codeBlock?: {
    language: string;
    code: string;
    description?: string;
    autoExecute?: boolean;
    filePath?: string; // Target path to write/edit in workspace
  };
  searchResults?: SearchResult[];
  activeKeyLabel?: string;
}

export interface P2PChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type: 'text' | 'file' | 'codeShare';
  fileName?: string;
  fileSize?: string;
  fileContent?: string; // base64 or raw text
  isEdited?: boolean;
  originalText?: string;
  translation?: string;
  sharedFile?: VirtualFile;
}

export interface P2PChat {
  id: string; // Peer ID or custom room code
  title: string;
  type: 'direct' | 'group' | 'channel';
  messages: P2PChatMessage[];
  unreadCount: number;
  peerId?: string; // For WebRTC direct peer
  description?: string;
}

export interface VirtualFile {
  id: string;
  name: string;
  path: string; // absolute path inside workspace (e.g., 'src/main.js')
  content: string;
  language: string;
}

export interface VirtualFolder {
  id: string;
  name: string;
  path: string; // e.g. 'src'
}

