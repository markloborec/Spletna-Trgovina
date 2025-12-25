import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  @Output() close = new EventEmitter<void>();

  view: 'login' | 'forgot' | 'reset' = 'login';

  formData = {
    email: '',
    password: '',
  };

  forgotData = {
    email: '',
  };

  resetData = {
    token: '',
    newPassword: '',
    confirmPassword: '',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) { }

  onSubmit() {
    if (this.view !== 'login') return;

    this.errorMessage = '';
    this.successMessage = '';

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
    if (this.view !== 'login') {
      this.view = 'login';
      this.errorMessage = '';
      this.successMessage = '';
      return;
    }
    this.close.emit();
  }

  onForgotPassword() {
    this.errorMessage = '';
    this.successMessage = '';
    this.forgotData.email = this.formData.email || '';
    this.view = 'forgot';
  }

  submitForgotPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.forgotData.email) {
      this.errorMessage = 'Prosimo, vpiši e-pošto.';
      return;
    }

    this.isSubmitting = true;
    this.authService.forgotPassword(this.forgotData.email).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        this.successMessage =
          'Če račun s tem e-poštnim naslovom obstaja, smo poslali navodila za ponastavitev gesla.';

        if (res?.resetToken) {
          this.resetData.token = res.resetToken;
          this.view = 'reset';
          this.successMessage = 'Vnesi novo geslo (token je že izpolnjen).';
        }
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        const code = err?.error?.error;
        this.errorMessage = code || 'Zahteva za ponastavitev ni uspela.';
      },
    });
  }

  submitResetPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.resetData.token || !this.resetData.newPassword || !this.resetData.confirmPassword) {
      this.errorMessage = 'Prosimo, izpolni vsa polja.';
      return;
    }

    if (this.resetData.newPassword !== this.resetData.confirmPassword) {
      this.errorMessage = 'Gesli se ne ujemata.';
      return;
    }

    this.isSubmitting = true;
    this.authService.resetPassword(this.resetData.token, this.resetData.newPassword).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Geslo je uspešno spremenjeno. Sedaj se lahko prijaviš.';
        this.formData.email = this.forgotData.email || this.formData.email;
        this.formData.password = '';
        this.view = 'login';
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        const code = err?.error?.error;
        this.errorMessage = code || 'Ponastavitev gesla ni uspela.';
      },
    });
  }
}
