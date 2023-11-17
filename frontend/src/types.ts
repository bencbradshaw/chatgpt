export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'bot';
  content: string;
  custom?: string;
}
export type ChatHistory = ChatHistoryItem[];
