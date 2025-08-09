import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm: FormGroup;
  isSubmitting = false;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  ngAfterViewInit() {
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
      }, 0);
    }
  }

  private initFormAnimations() {
    const inputs = document.querySelectorAll('.login-form input');
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

  onSubmit() {
    if (this.loginForm.valid && !this.isSubmitting) {
      console.log('Setting isSubmitting to true');
      this.isSubmitting = true;
      this.cdr.detectChanges();
      
      const { email, password } = this.loginForm.value;

      this.authService.login({ username: email, password }).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          
          // Store user data and redirect
          this.authService.setCurrentUser(response.data);
          this.router.navigate([this.returnUrl]);
          
          console.log('Setting isSubmitting to false (success)');
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Login failed:', error);
          console.log('Setting isSubmitting to false (error)');
          this.isSubmitting = false;
          this.cdr.detectChanges();
          // Handle error (e.g., show error message)
        }
      });
    }
  }
}