import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  @Output() close = new EventEmitter<void>();

  formData = {
    email: '',
    password: ''
  };

   isSubmitting = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.formData.email || !this.formData.password) {
      this.errorMessage = 'Prosimo, izpolni e-pošto in geslo.';
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        console.log('LOGIN OK:', res);
        this.close.emit();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        const code = err?.error?.error;
        this.errorMessage = code || 'Prijava ni uspela.';
      },
    });
  }

  onCancel() {
    this.close.emit();
  }

  onForgotPassword() {
    console.log('Pozabljeno geslo kliknjeno');
  }
}
