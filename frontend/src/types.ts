export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'bot';
  content: string;
  custom?: string;
}
export type ChatHistory = ChatHistoryItem[];

export type Engine =
  | 'gpt-4-1106-preview'
  | 'gpt-4'
  | 'gpt-4-vision-preview'
  | 'gpt-3.5-turbo'
  | 'dall-e-3'
  | 'dall-e-2'
  | 'tts-1'
  | 'vertex'
  | 'auto';
export interface Thread {
  id?: IDBValidKey;
  headline: string;
  system_message: string;
  selected_engine: Engine;
  include_context: boolean;
  history: ChatHistory;
}
