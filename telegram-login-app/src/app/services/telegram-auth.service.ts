import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
  private botToken =  ''; // Replace with your bot token - keep this secure on server side!
  
  // Add a BehaviorSubject to track authentication state
  private currentUserSubject = new BehaviorSubject<TelegramAuthResult | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { 
    // Initialize the user from localStorage when service starts
    const userData = this.getAuthUser();
    this.currentUserSubject.next(userData);
  }

  processAuth(authData: TelegramAuthResult): Observable<TelegramAuthResult> {
    // Save user info to localStorage
    localStorage.setItem('telegram_user', JSON.stringify(authData));
    console.log('User data saved to localStorage');
    
    // Update the current user subject
    this.currentUserSubject.next(authData);
    
    return of(authData).pipe(
      tap(data => console.log('Auth data processed and returned:', data))
    );
  }

  isAuthenticated(): boolean {
    const userData = localStorage.getItem('telegram_user');
    if (!userData) {
      console.log('No user data in localStorage');
      return false;
    }
    
    try {
      const user = JSON.parse(userData) as TelegramAuthResult;
      // Check if auth_date is not older than 1 day
      const authTimestamp = user.auth_date * 1000; // Convert to milliseconds
      const currentTime = new Date().getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      const isStillValid = (currentTime - authTimestamp) < oneDayMs;
      console.log('Auth validity check:', isStillValid ? 'valid' : 'expired');
      
      return isStillValid;
    } catch (e) {
      console.error('Error parsing user data from localStorage', e);
      return false;
    }
  }

  getAuthUser(): TelegramAuthResult | null {
    if (!this.isAuthenticated()) {
      console.log('User is not authenticated or session expired');
      return null;
    }
    
    const userData = localStorage.getItem('telegram_user');
    if (!userData) {
      console.log('No user data found in localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(userData) as TelegramAuthResult;
      console.log('Retrieved user data from localStorage:', user);
      return user;
    } catch (e) {
      console.error('Error parsing user data from localStorage', e);
      return null;
    }
  }

  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem('telegram_user');
    // Update the current user subject
    this.currentUserSubject.next(null);
  }
}
