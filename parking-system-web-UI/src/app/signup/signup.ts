import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService, SignupRequest } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class SignupComponent implements OnInit, AfterViewInit {
  signupForm: FormGroup;
  isSubmitting = false;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
    const inputs = document.querySelectorAll('.signup-form input, .signup-form textarea');
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
    if (this.signupForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData: SignupRequest = this.signupForm.value;

      // Using Observable
      this.authService.signup(formData).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          this.isSubmitting = false;
          this.signupForm.reset();
          // Redirect to login page with return URL
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl } });
        },
        error: (error) => {
          console.error('Signup failed:', error);
          this.isSubmitting = false;
          // Handle error (e.g., show error message)
        }
      });

      // Alternative using Promise
      // this.authService.signupPromise(formData)
      //   .then(response => {
      //     console.log('Signup successful:', response);
      //     this.isSubmitting = false;
      //     this.signupForm.reset();
      //   })
      //   .catch(error => {
      //     console.error('Signup failed:', error);
      //     this.isSubmitting = false;
      //   });
    }
  }

  openDatePicker(event: Event) {
    const input = event.target as HTMLInputElement;
    input.showPicker();
  }
}