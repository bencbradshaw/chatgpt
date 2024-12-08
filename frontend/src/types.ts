export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'bot';
  content: string;
  custom?: string;
}
export type ChatHistory = ChatHistoryItem[];

export type Engine = 'gpt-4o-mini-2024-07-18' | 'gpt-4o-mini' | 'gpt-4o' | 'dall-e-3' | 'tts-1' | 'vertex' | 'auto';
export interface Thread {
  id?: IDBValidKey;
  headline: string;
  system_message: string;
  selected_engine: Engine;
  include_context: boolean;
  history: ChatHistory;
}
