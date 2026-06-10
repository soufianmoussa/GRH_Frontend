import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { ChatMessage, ChatRequest, ChatResponse } from './chatbot.models';
import { AssistantContext } from '../../../core/navigation/navigation.models';

/**
 * Talks to the backend assistant endpoint. The JWT is attached automatically by
 * the global `authInterceptor`, and the Gemini API key never reaches the browser.
 */
@Injectable({ providedIn: 'root' })
export class ChatbotService {

  private readonly API_URL = `${environment.apiUrl}/assistant`;

  constructor(private http: HttpClient) {}

  /**
   * Send a user message together with the recent conversation history and the
   * live navigation context used to ground the assistant.
   * @param message the new user message.
   * @param history prior turns (already capped by the caller).
   * @param context the navigation context (role, current screen, accessible screens).
   */
  chat(message: string, history: ChatMessage[], context?: AssistantContext): Observable<ChatResponse> {
    const body: ChatRequest = { message, history, context };
    return this.http.post<ChatResponse>(`${this.API_URL}/chat`, body);
  }
}
