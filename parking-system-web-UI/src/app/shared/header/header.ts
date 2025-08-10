import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { AuthService, UserViewModel } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit, AfterViewInit {
  currentUser: UserViewModel | null = null;
  isDropdownOpen = false;
  isMobileMenuOpen = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
    });
    
    if (isPlatformBrowser(this.platformId)) {
      this.initHeaderAnimations();
      this.initClickOutside();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Header should be visible immediately
      setTimeout(() => {
        const header = document.querySelector('.header');
        if (header) {
          header.classList.add('animate-in');
        }
      }, 50);
    }
  }

  private initHeaderAnimations() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
          if (window.scrollY > 50) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
        }
      });
    }
  }

  private initClickOutside() {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) {
          this.isDropdownOpen = false;
        }
      });
    }
  }

  isUser(): boolean {
    return this.currentUser?.Role === 'User';
  }

  isAdmin(): boolean {
    return this.currentUser?.Role === 'Admin';
  }

  toggleDropdown(): void {
    console.log('Dropdown toggle clicked, current state:', this.isDropdownOpen);
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('New dropdown state:', this.isDropdownOpen);
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.closeDropdown();
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
