import {
  Component,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelegramAuthResult } from '../services/telegram-auth.service';

// Add TypeScript interface for window.Telegram
declare global {
  interface Window {
    Telegram?: {
      Login: {
        auth: (options: any) => void;
      };
    };
    TelegramLoginWidget?: any;
  }
}

@Component({
  selector: 'app-telegram-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './telegram-login.component.html',
  styleUrl: './telegram-login.component.scss',
})
export class TelegramLoginComponent implements AfterViewInit {
  @Output() callback = new EventEmitter<TelegramAuthResult>();
  @Input() buttonSize: 'large' | 'medium' | 'small' = 'large';

  userData: TelegramAuthResult | null = null;
  private botId: number = 8016901412;
  private botName: string = 'betsson_test_bot';
  private cornerRadius: number = 20;
  private requestAccess: 'write' | false = false;
  private usePic: boolean = true;

  constructor(
    private el: ElementRef,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    // Check if we need to reload the widget after login
    const userData = localStorage.getItem('telegram_user');
    if (userData) {
      setTimeout(() => this.checkAuthStatus(), 0);
    }
  }

  checkAuthStatus(): void {
    // Check if there's user data in localStorage and emit it
    const userData = localStorage.getItem('telegram_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userData = user;
        // Force re-rendering
        this.zone.run(() => {
          this.callback.emit(user);
          this.cdr.detectChanges();
        });
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }

  startTelegramLogin(): void {
    // Load the Telegram script once the button is clicked
    setTimeout(() => this.loadTelegramScript(), 0);
  }

  private loadTelegramScript(): void {
    // Check if Telegram script is already loaded
    if (window.Telegram) {
      this.initTelegramWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js';
    script.async = true;
    script.onload = () => this.initTelegramWidget();
    document.head.appendChild(script);
  }

  private initTelegramWidget(): void {
    // Check if Telegram is available
    if (!window.Telegram) {
      console.error('Telegram widget is not available');
      return;
    }

    // Clean up any previous widget instances
    const existingElements = document.querySelectorAll('iframe[src*="telegram.org/auth"]');
    existingElements.forEach(el => el.remove());

    // Create a container element for the Telegram widget
    const container = document.createElement('div');
    container.id = 'telegram-login-container';
    document.body.appendChild(container);

    // Create the Telegram Login widget
    window.TelegramLoginWidget = {
      dataOnauth: (user: TelegramAuthResult) => {
        console.log('Telegram widget auth callback triggered with user data:', user);
        this.onTelegramAuth(user);
      },
    };

    try {
      console.log('Initializing Telegram widget with bot ID:', this.botName);
      window.Telegram.Login.auth({
        bot_id: this.botId,
        bot_name: this.botName,
        request_access: this.requestAccess ? 'write' : false,
        button_size: this.buttonSize,
        radius: this.cornerRadius,
        onAuth: (user: any) => {
          // Ensure this runs inside Angular zone to trigger change detection
          this.zone.run(() => {
            console.log('onAuth callback from Telegram received:', user);
            window.TelegramLoginWidget.dataOnauth(user);
          });
        },
        usePic: this.usePic,
      });
    } catch (error) {
      console.error('Error initializing Telegram widget:', error);
    }
  }

  onTelegramAuth(user: TelegramAuthResult): void {
    console.log('Telegram authentication successful:', user);
    this.userData = user; // Store the user data
    
    // Use NgZone to ensure Angular knows about this update
    this.zone.run(() => {
      this.callback.emit(user);
      this.cdr.detectChanges();
    });
  }
}
