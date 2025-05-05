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
    // Initial check is now handled in ngOnInit
  }
  
  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('Auth state updated:', user);
      this.userData = user;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  
  onTelegramAuth(user: TelegramAuthResult): void {
    console.log('User info received in app component:', user);
    this.authService.processAuth(user).subscribe({
      next: (authData) => {
        console.log('Authentication processed successfully', authData);
        // No need to set this.userData here as it will update via subscription
      },
      error: (error) => {
        console.error('Authentication failed', error);
      }
    });
  }
  
  logout(): void {
    this.authService.logout();
    // No need to set this.userData = null here as it will update via subscription
  }
}
