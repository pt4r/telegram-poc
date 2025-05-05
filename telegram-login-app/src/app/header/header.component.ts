import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelegramLoginComponent } from '../telegram-login/telegram-login.component';
import { TelegramAuthService, TelegramAuthResult } from '../services/telegram-auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TelegramLoginComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  userData: TelegramAuthResult | null = null;
  private authSubscription: Subscription | undefined;
  
  constructor(private authService: TelegramAuthService) {}

  ngOnInit(): void {
    // Subscribe to the auth state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.userData = user;
      console.log('Auth state updated:', user);
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onTelegramAuth(user: TelegramAuthResult): void {
    this.authService.processAuth(user).subscribe({
      next: (authData) => {
        console.log('Authentication successful', authData);
        // No need to set this.userData here as it will be updated via the subscription
      },
      error: (error) => {
        console.error('Authentication failed', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    // No need to set this.userData = null here as it will be updated via the subscription
  }
}
