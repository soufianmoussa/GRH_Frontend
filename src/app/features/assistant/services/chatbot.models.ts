/** Roles understood by the backend / Gemini ("user" = human, "model" = assistant). */
export type ChatRole = 'user' | 'model';

/** A single message exchanged in the conversation. */
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Request payload sent to POST /api/assistant/chat. */
export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

/** Response returned by the backend. */
export interface ChatResponse {
  reply: string;
  model: string;
}
