import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage = '';

  onSubmit() {
  if (this.loginForm.invalid) return;

  const { email, password } = this.loginForm.value;

  this.authService.login(email, password).subscribe({
    next: (res) => {

      const role = res.user?.role;
      console.log('✅ Role:', role);

      localStorage.setItem('user', JSON.stringify(res.user));
      this.router.navigate(['/chat']);

      // 🔥 délai pour éviter bug guard
      setTimeout(() => {

        if (role === 'STAGIAIRE') {
          this.router.navigate(['/stagiaire']);
        } else if (role === 'ENCADRANT_PRO') {
          this.router.navigate(['/encadrant']);
        } else if (role === 'ENCADRANT_ACAD') {
          this.router.navigate(['/encadrant']);
        } else if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        }

      }, 50);
    },

    error: () => {
      this.errorMessage = "Email ou mot de passe incorrect.";
    }
  });
}
}