import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

// Define interface for telegram auth result
export interface TelegramAuthResult {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

@Injectable({
  providedIn: 'root'
})
export class TelegramAuthService {
  private botToken =  '8016901412:AAEEBRu9zuw-QG6h0lF83xTDBAg14nUlUHQ'; // Replace with your bot token - keep this secure on server side!

  constructor(private http: HttpClient) { }

  /**
   * Process authentication data received from Telegram
   */
  processAuth(authData: TelegramAuthResult): Observable<TelegramAuthResult> {
    // In a real application, NEVER verify on client side
    // This should be done on your backend for security reasons
    // This is just for demo purposes
    
    if (this.validateAuthData(authData)) {
      // Save user info to localStorage or your preferred storage
      localStorage.setItem('telegram_user', JSON.stringify(authData));
      return of(authData);
    } else {
      return throwError(() => new Error('Invalid authentication data'));
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const userData = localStorage.getItem('telegram_user');
    if (!userData) return false;
    
    try {
      const user = JSON.parse(userData) as TelegramAuthResult;
      // Check if auth_date is not older than 1 day
      const authTimestamp = user.auth_date * 1000; // Convert to milliseconds
      const currentTime = new Date().getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      return (currentTime - authTimestamp) < oneDayMs;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get the authenticated user data
   */
  getAuthUser(): TelegramAuthResult | null {
    if (!this.isAuthenticated()) return null;
    
    const userData = localStorage.getItem('telegram_user');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData) as TelegramAuthResult;
    } catch (e) {
      return null;
    }
  }

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem('telegram_user');
  }

  /**
   * Validate the authentication data from Telegram
   * WARNING: In production, this should be done on the server side!
   */
  private validateAuthData(authData: TelegramAuthResult): boolean {
    // In a real application, this validation should happen on the server!
    // Client-side validation is insecure and shown for demonstration only.
    
    // Check if auth_date is recent (within the last day)
    const authTimestamp = authData.auth_date * 1000; // Convert to milliseconds
    const currentTime = new Date().getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if ((currentTime - authTimestamp) > oneDayMs) {
      console.error('Authentication data is too old');
      return false;
    }

    // In a real application, you would verify the hash here
    // This requires your bot token which should NEVER be in client-side code
    // This should be done on your secure backend
    
    return true; // For demo purposes only!
  }

  /**
   * IMPORTANT: This method should ONLY be used on the server side!
   * It's shown here for educational purposes only.
   */
  private checkSignature(authData: TelegramAuthResult, botToken: string): boolean {
    const dataCheckString = Object.keys(authData)
      .filter(key => key !== 'hash')
      .sort()
      .map(key => `${key}=${authData[key as keyof TelegramAuthResult]}`)
      .join('\n');

    const secretKey = CryptoJS.SHA256(botToken);
    const hash = CryptoJS.HmacSHA256(dataCheckString, secretKey).toString(CryptoJS.enc.Hex);
    
    return hash === authData.hash;
  }
}
