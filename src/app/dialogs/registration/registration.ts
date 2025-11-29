import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
})
export class Registration {
  @Output() close = new EventEmitter<void>();

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isSubmitting = false;
  errorMessage = '';

  onSubmit() {
    this.errorMessage = '';

    if (!this.formData.email || !this.formData.password) {
      this.errorMessage = 'Prosimo, izpolni vsaj e-pošto in geslo.';
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Gesli se ne ujemata.';
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
}
