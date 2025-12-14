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

export type Engine =
  | 'gpt-5.2'
  | 'gpt-5.1'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-nano'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'o3-mini'
  | 'llama-3.3-70b'
  | 'llama-3.2-3b'
  | 'dolphin-2.9.2-qwen2-72b'
  | 'llama-3.1-405b'
  | 'qwen2.5-coder-32b'
  | 'deepseek-r1-671b'
  | 'deepseek-r1-llama-70b'
  | 'qwen-2.5-vl';
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
