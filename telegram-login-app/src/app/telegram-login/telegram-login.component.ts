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
    onTelegramAuth?: (user: TelegramAuthResult) => void;
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
  private widgetContainer: HTMLElement | null = null;

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

    // Create a container element for the Telegram widget if it doesn't exist
    if (!this.widgetContainer) {
      this.widgetContainer = document.createElement('div');
      this.widgetContainer.id = 'telegram-login-container';
      // Append the container to the component instead of body
      this.el.nativeElement.appendChild(this.widgetContainer);
    } else {
      // Clear the container
      this.widgetContainer.innerHTML = '';
    }

    // Set up the global callback that Telegram's widget will call
    window.onTelegramAuth = (user: TelegramAuthResult) => {
      console.log('Global onTelegramAuth called with user:', user);
      this.zone.run(() => {
        this.onTelegramAuth(user);
      });
    };

    try {
      console.log('Initializing Telegram widget with bot ID:', this.botName);
      
      // Create a script element for the Telegram Login button
      const loginScript = document.createElement('script');
      loginScript.async = true;
      loginScript.src = "https://telegram.org/js/telegram-widget.js";
      loginScript.setAttribute('data-telegram-login', this.botName);
      loginScript.setAttribute('data-size', this.buttonSize);
      loginScript.setAttribute('data-radius', this.cornerRadius.toString());
      loginScript.setAttribute('data-request-access', this.requestAccess ? 'write' : 'read');
      loginScript.setAttribute('data-userpic', this.usePic.toString());
      loginScript.setAttribute('data-onauth', 'onTelegramAuth(user)');
      
      // Append the login script to the container
      this.widgetContainer.appendChild(loginScript);
      
      console.log('Telegram login button added to DOM');
    } catch (error) {
      console.error('Error initializing Telegram widget:', error);
    }
  }

  onTelegramAuth(user: TelegramAuthResult): void {
    console.log('Telegram authentication successful:', user);
    this.userData = user; // Store the user data
    
    // Store user data in local storage
    localStorage.setItem('telegram_user', JSON.stringify(user));
    
    // Use NgZone to ensure Angular knows about this update
    this.zone.run(() => {
      this.callback.emit(user);
      this.cdr.detectChanges();
    });
  }
}
