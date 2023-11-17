export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  custom?: string;
}
export type ChatHistory = ChatHistoryItem[];
