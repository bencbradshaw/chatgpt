export class TextEventStream implements AsyncIterable<string> {
  constructor(private response: Response) {}
  async *[Symbol.asyncIterator](): AsyncIterator<string> {
    const reader = this.response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (!reader) {
      throw new Error('Failed to get reader from response body');
    }
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
      }
    } finally {
      reader.releaseLock();
    }
  }
}
