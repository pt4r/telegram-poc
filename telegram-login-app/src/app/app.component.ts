import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TelegramLoginComponent } from './telegram-login/telegram-login.component';
import { TelegramAuthService, TelegramAuthResult } from './services/telegram-auth.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TelegramLoginComponent, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'telegram-login-app';
  userData: TelegramAuthResult | null = null;
  private authSubscription: Subscription | undefined;
  
  constructor(private authService: TelegramAuthService) {
  }
  
  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('Auth state updated:', user);
      this.userData = user;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  
  onTelegramAuth(user: TelegramAuthResult): void {
    this.authService.processAuth(user).subscribe({
      next: (authData) => {
        console.log('Authentication processed successfully', authData);
      },
      error: (error) => {
        console.error('Authentication failed', error);
      }
    });
  }
  
  logout(): void {
    this.authService.logout();
  }
}
