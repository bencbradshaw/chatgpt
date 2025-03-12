export interface IFile {
  name: string;
  extension: string;
  content: string;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'bot';
  content: string;
  files?: IFile[];
  custom?: string;
}
export type IChatHistory = ChatHistoryItem[];

export type Engine = 'gpt-4o-mini' | 'gpt-4o';
export interface Thread {
  id?: IDBValidKey;
  headline: string;
  system_message: string;
  selected_engine: Engine;
  include_context: boolean;
  history: IChatHistory;
}
export interface SystemMessage {
  id: IDBValidKey;
  text: string;
}
