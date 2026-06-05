import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatbotService } from './services/chatbot.service';
import { ChatMessage } from './services/chatbot.models';

/** Maximum number of prior turns kept in context (must match backend cap of 20). */
const MAX_HISTORY = 20;

/** A message as displayed in the UI (adds a transient flag for failed sends). */
interface UiMessage extends ChatMessage {
  failed?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollArea') private scrollArea?: ElementRef<HTMLDivElement>;
  @ViewChild('input') private input?: ElementRef<HTMLTextAreaElement>;

  /** Panel open/closed state. */
  readonly open = signal(false);
  /** In-flight request flag (drives the typing indicator + disabled input). */
  readonly loading = signal(false);
  /** Last error message (cleared on the next successful/new send). */
  readonly errorMessage = signal<string | null>(null);
  /** Conversation messages shown in the panel. */
  readonly messages = signal<UiMessage[]>([]);

  /** Bound to the textarea. */
  draft = '';

  /** Suggested prompts shown on the empty state. */
  readonly suggestions = [
    'ASSISTANT.SUGGESTIONS.LEAVE',
    'ASSISTANT.SUGGESTIONS.DOCUMENTS',
    'ASSISTANT.SUGGESTIONS.CAREER',
  ];

  private shouldScroll = false;
  private lastUserMessage: string | null = null;

  constructor(
    private chatbotService: ChatbotService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggle(): void {
    this.open.update(v => !v);
    if (this.open()) {
      setTimeout(() => this.input?.nativeElement.focus(), 150);
      this.shouldScroll = true;
    }
  }

  close(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  /** Whether the send button should be enabled. */
  get canSend(): boolean {
    return !this.loading() && this.draft.trim().length > 0;
  }

  onKeydown(event: KeyboardEvent): void {
    // Enter sends; Shift+Enter inserts a newline.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  useSuggestion(key: string): void {
    this.draft = this.translate.instant(key);
    setTimeout(() => this.input?.nativeElement.focus(), 0);
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || this.loading()) {
      return;
    }

    this.errorMessage.set(null);
    this.lastUserMessage = text;

    // Snapshot history BEFORE adding the new user message (backend appends it).
    const history = this.buildHistory();

    this.messages.update(list => [...list, { role: 'user', content: text }]);
    this.draft = '';
    this.shouldScroll = true;
    this.loading.set(true);

    this.chatbotService.chat(text, history).subscribe({
      next: response => {
        this.messages.update(list => [...list, { role: 'model', content: response.reply }]);
        this.loading.set(false);
        this.shouldScroll = true;
      },
      error: err => {
        this.loading.set(false);
        // Mark the last user message as failed so the user can retry it.
        this.messages.update(list => {
          const copy = [...list];
          const last = copy[copy.length - 1];
          if (last && last.role === 'user') {
            copy[copy.length - 1] = { ...last, failed: true };
          }
          return copy;
        });
        this.errorMessage.set(this.resolveError(err));
        this.shouldScroll = true;
      },
    });
  }

  /** Retry the last failed message. */
  retry(): void {
    if (this.loading() || !this.lastUserMessage) {
      return;
    }
    // Drop the failed user bubble + any trailing error, then resend it.
    const text = this.lastUserMessage;
    this.messages.update(list => {
      const copy = [...list];
      if (copy.length && copy[copy.length - 1].failed) {
        copy.pop();
      }
      return copy;
    });
    this.draft = text;
    this.send();
  }

  clear(): void {
    this.messages.set([]);
    this.errorMessage.set(null);
    this.lastUserMessage = null;
  }

  /** Build the capped, success-only history to send as context. */
  private buildHistory(): ChatMessage[] {
    return this.messages()
      .filter(m => !m.failed)
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));
  }

  private resolveError(err: unknown): string {
    const e = err as { error?: { message?: string }; status?: number };
    if (e?.error?.message) {
      return e.error.message;
    }
    if (e?.status === 0) {
      return this.translate.instant('ASSISTANT.ERROR_NETWORK');
    }
    return this.translate.instant('ASSISTANT.ERROR_GENERIC');
  }

  private scrollToBottom(): void {
    const el = this.scrollArea?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
