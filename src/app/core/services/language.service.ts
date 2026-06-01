import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'sirh.lang';
  private readonly defaultLanguage: AppLanguage = 'fr';
  private readonly supportedLanguages: AppLanguage[] = ['fr', 'en'];

  constructor(private translate: TranslateService) {}

  init(): void {
    this.translate.addLangs(this.supportedLanguages);
    this.translate.setFallbackLang(this.defaultLanguage);
    this.use(this.getStoredLanguage());
  }

  current(): AppLanguage {
    const lang = this.translate.currentLang || this.translate.getFallbackLang() || this.defaultLanguage;
    return this.isSupported(lang) ? lang : this.defaultLanguage;
  }

  toggle(): AppLanguage {
    return this.use(this.current() === 'fr' ? 'en' : 'fr');
  }

  use(language: AppLanguage): AppLanguage {
    this.translate.use(language);
    localStorage.setItem(this.storageKey, language);
    return language;
  }

  private getStoredLanguage(): AppLanguage {
    const storedLanguage = localStorage.getItem(this.storageKey);
    return this.isSupported(storedLanguage) ? storedLanguage : this.defaultLanguage;
  }

  private isSupported(language: string | null): language is AppLanguage {
    return this.supportedLanguages.includes(language as AppLanguage);
  }
}
