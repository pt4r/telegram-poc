import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TelegramLoginComponent } from './telegram-login/telegram-login.component';
import { TelegramAuthService, TelegramAuthResult } from './services/telegram-auth.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TelegramLoginComponent, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'telegram-login-app';
  userData: TelegramAuthResult | null = null;
  
  constructor(private authService: TelegramAuthService) {
    // Check if we already have a logged-in user
    this.userData = this.authService.getAuthUser();
  }
  
  onTelegramAuth(user: TelegramAuthResult): void {
    console.log('User info:', user);
    this.authService.processAuth(user).subscribe({
      next: (authData) => {
        console.log('Authentication successful', authData);
        this.userData = authData;
      },
      error: (error) => {
        console.error('Authentication failed', error);
      }
    });
  }
  
  logout(): void {
    this.authService.logout();
    this.userData = null;
  }
}
