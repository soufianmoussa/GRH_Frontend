import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { ChatMessage, ChatRequest, ChatResponse } from './chatbot.models';

/**
 * Talks to the backend assistant endpoint. The JWT is attached automatically by
 * the global `authInterceptor`, and the Gemini API key never reaches the browser.
 */
@Injectable({ providedIn: 'root' })
export class ChatbotService {

  private readonly API_URL = `${environment.apiUrl}/assistant`;

  constructor(private http: HttpClient) {}

  /**
   * Send a user message together with the recent conversation history.
   * @param message the new user message.
   * @param history prior turns (already capped by the caller).
   */
  chat(message: string, history: ChatMessage[]): Observable<ChatResponse> {
    const body: ChatRequest = { message, history };
    return this.http.post<ChatResponse>(`${this.API_URL}/chat`, body);
  }
}
