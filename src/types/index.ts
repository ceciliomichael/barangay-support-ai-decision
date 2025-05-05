export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Resident {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: Date;
}

export interface Verification {
  status: 'pending' | 'approved' | 'rejected';
  aiSuggestion: string | null;
  aiReason?: string;
  processedAt?: Date;
}

export interface Concern {
  _id?: string;
  id?: number;
  text: string;
  residentId: string;
  residentName?: string;
  timestamp: Date;
  verification?: Verification;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: Date;
  verification?: Verification;
  residentId?: string;
}

export interface MistralMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MistralRequestBody {
  model: string;
  messages: MistralMessage[];
  max_tokens: number;
  temperature: number;
}

export interface MistralResponseChoice {
  index: number;
  message: MistralMessage;
  finish_reason: string;
}

export interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: MistralResponseChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} 