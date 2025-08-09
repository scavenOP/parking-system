import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit, AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initHeaderAnimations();
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
}
