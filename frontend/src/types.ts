export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'bot';
  content: string;
  custom?: string;
}
export type ChatHistory = ChatHistoryItem[];

export interface Thread {
  id?: number;
  headline: string;
  system_message: string;
  history: ChatHistory;
}
