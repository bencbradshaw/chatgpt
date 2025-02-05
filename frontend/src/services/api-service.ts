import type { Engine, IChatHistory } from '../types.js';
import { TextEventStream } from './text-event-stream.js';

export class ApiService {
  static async post(endpoint: string, body: any): Promise<Response> {
    let headers = {};
    if (body instanceof FormData) {
      headers = {
        Accept: 'application/json'
      };
    } else {
      headers = {
        'Content-Type': 'application/json'
      };
    }
    const response = await fetch(`${endpoint}`, {
      method: 'POST',
      headers,
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
    return response;
  }

  async postToChat(history: IChatHistory, engine: Engine, system_message: string): Promise<TextEventStream> {
    const reqBody = {
      messages: [
        {
          role: 'system',
          content: system_message
        },
        ...history.map((item) => ({ role: item.role, content: item.content }))
      ],
      engine
    };
    return new TextEventStream(await ApiService.post('/chat', reqBody));
  }
}
