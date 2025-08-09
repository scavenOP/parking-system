import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Cookies from 'js-cookie';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly isProduction = false; // Set to true in production

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  set(key: string, value: string, options?: {
    expires?: number;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    httpOnly?: boolean;
  }): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const defaultOptions = {
      expires: 7, // 7 days
      secure: this.isProduction, // Only secure in production (HTTPS)
      sameSite: 'strict' as const,
      path: '/'
    };

    const finalOptions = { ...defaultOptions, ...options };
    Cookies.set(key, value, finalOptions);
  }

  get(key: string): string | undefined {
    if (!isPlatformBrowser(this.platformId)) return undefined;
    return Cookies.get(key);
  }

  remove(key: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    Cookies.remove(key, { path: '/' });
  }

  exists(key: string): boolean {
    return this.get(key) !== undefined;
  }
}