import {
  Component,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
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

  showWidget: boolean = true;
  private botId: number = 8016901412;
  private botName: string = 'betsson_test_bot';
  private cornerRadius: number = 20;
  private requestAccess: 'write' | false = false;
  private usePic: boolean = true;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    // No longer auto-loading the script on component initialization
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

    // Create a unique ID for the container
    const containerId = 'telegram-login-' + Math.floor(Math.random() * 1000);

    // Set the ID to the element
    const container = this.el.nativeElement.querySelector(
      '#telegram-login-container'
    );
    container.id = containerId;

    // Create the Telegram Login widget
    // @ts-ignore - Telegram widget is loaded from external script
    window.TelegramLoginWidget = {
      dataOnauth: (user: TelegramAuthResult) => {
        this.onTelegramAuth(user);
      },
    };

    try {
      console.log('Initializing Telegram widget with bot ID:', this.botName);
      window.Telegram.Login.auth({
        bot_id: this.botId,
        bot_name: this.botName,
        request_access: this.requestAccess ? 'write' : false,
        element: document.getElementById(containerId),
        button_size: this.buttonSize,
        radius: this.cornerRadius,
        onAuth: (user: any) => window.TelegramLoginWidget.dataOnauth(user),
        usePic: this.usePic,
      });
    } catch (error) {
      console.error('Error initializing Telegram widget:', error);
    }
  }

  onTelegramAuth(user: TelegramAuthResult): void {
    console.log('Telegram authentication successful:', user);
    this.showWidget = false;
    this.callback.emit(user);
  }
}
