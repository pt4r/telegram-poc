import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelegramLoginComponent } from '../telegram-login/telegram-login.component';
import { TelegramAuthService, TelegramAuthResult } from '../services/telegram-auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TelegramLoginComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userData: TelegramAuthResult | null = null;
  
  constructor(private authService: TelegramAuthService) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    this.userData = this.authService.getAuthUser();
  }

  onTelegramAuth(user: TelegramAuthResult): void {
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
