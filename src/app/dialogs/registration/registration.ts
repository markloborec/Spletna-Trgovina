import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
})
export class Registration {
  @Output() close = new EventEmitter<void>();

  formData: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    deliveryAddress: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit(form?: NgForm) {
    this.errorMessage = '';

    if (
      !this.formData.firstName ||
      !this.formData.lastName ||
      !this.formData.email ||
      !this.formData.deliveryAddress ||
      !this.formData.phone ||
      !this.formData.password ||
      !this.formData.confirmPassword
    ) {
      this.errorMessage = 'Prosimo, izpolni vsa obvezna polja.';
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Gesli se ne ujemata.';
      return;
    }

    this.isSubmitting = true;

    const payload: RegisterRequest = { ...this.formData };
    delete payload.confirmPassword;

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        // uspešna registracija – zapri dialog
        this.close.emit();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message || 'Pri registraciji je prišlo do napake.';
      },
    });
  }

  onCancel() {
    this.close.emit();
  }
}
