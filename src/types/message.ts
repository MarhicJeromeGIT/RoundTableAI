
export interface Message {
  id: number;
  text: string;
  type: 'user' | 'bot' | 'narrator';
  name?: string;
  description?: string;
}