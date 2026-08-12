import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  readonly canInstall = signal(false);
  private prompt: BeforeInstallPromptEvent | null = null;

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.prompt = e as BeforeInstallPromptEvent;
      this.canInstall.set(true);
    });
    window.addEventListener('appinstalled', () => {
      this.prompt = null;
      this.canInstall.set(false);
    });
  }

  async install(): Promise<void> {
    if (this.prompt) {
      await this.prompt.prompt();
      const { outcome } = await this.prompt.userChoice;
      if (outcome === 'accepted') {
        this.prompt = null;
        this.canInstall.set(false);
      }
    }
  }
}
