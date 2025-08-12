import { Injectable } from '@angular/core';
import Cookies from 'js-cookie';

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  set(name: string, value: string, options?: CookieOptions): void {
    Cookies.set(name, value, options);
  }

  get(name: string): string | undefined {
    return Cookies.get(name);
  }

  remove(name: string, options?: CookieOptions): void {
    Cookies.remove(name, options);
  }

  getAll(): { [key: string]: string } {
    return Cookies.get();
  }
}