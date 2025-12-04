import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  onSubmit() {
    this.errorMessage = '';

    if (!this.formData.email || !this.formData.password) {
      this.errorMessage = 'Prosimo, izpolni e-pošto in geslo.';
      return;
    }

    this.isSubmitting = true;

    // tukaj pride klic na API / auth service
    setTimeout(() => {
      this.isSubmitting = false;
      // Za demo
      this.close.emit();
    }, 800);
  }

  onCancel() {
    this.close.emit();
  }
  onForgotPassword() {
    // TODO: tukaj kasneje odpreš modal / preusmeriš na "reset password" stran
    console.log('Pozabljeno geslo kliknjeno');
    // ali: alert('Funkcionalnost za ponastavitev gesla še ni implementirana.');
  }
}
