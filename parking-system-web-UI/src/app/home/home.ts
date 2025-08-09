import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initFormAnimations();
      this.initParallaxEffect();
    }
  }

  private initScrollAnimations() {
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, { threshold: 0.1 });

      setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
          observer.observe(el);
        });
      }, 100);
    }
  }

  private initFormAnimations() {
    const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', (e) => {
        (e.target as HTMLElement).parentElement?.classList.add('focused');
      });
      input.addEventListener('blur', (e) => {
        if (!(e.target as HTMLInputElement).value) {
          (e.target as HTMLElement).parentElement?.classList.remove('focused');
        }
      });
    });
  }

  private initParallaxEffect() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
          const speed = 0.5;
          const yPos = -(scrolled * speed);
          (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
        });
      });
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    form.classList.add('submitting');
    
    setTimeout(() => {
      form.classList.remove('submitting');
      form.classList.add('submitted');
      form.reset();
      
      setTimeout(() => {
        form.classList.remove('submitted');
      }, 3000);
    }, 2000);
  }
}
