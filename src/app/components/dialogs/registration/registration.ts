import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/user';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.html',
  styleUrls: ['./registration.scss'],
})
export class Registration implements AfterViewInit {
  @Output() close = new EventEmitter<void>();

  @ViewChild('dialogTitle', { static: false }) dialogTitle?: ElementRef<HTMLElement>;
  @ViewChild('firstField', { static: false }) firstField?: ElementRef<HTMLInputElement>;

  titleId = 'registration-dialog-title';
  descId = 'registration-dialog-desc';

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

  constructor(private authService: AuthService) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      (this.firstField?.nativeElement ?? this.dialogTitle?.nativeElement)?.focus();
    }, 0);
  }

  onBackdropClick(_: MouseEvent) {
    this.close.emit();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close.emit();
      return;
    }

    if (event.key !== 'Tab') return;

    const dialog = document.querySelector('.registration-dialog') as HTMLElement | null;
    if (!dialog) return;

    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true');

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    }
  }

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

    // confirmPassword je samo FE validacija
    const payload: any = { ...this.formData };
    delete payload.confirmPassword;

    this.authService.register(payload).subscribe({
      next: (user) => {
        this.isSubmitting = false;
        console.log('REGISTER OK (saved):', user);
        this.close.emit();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;

        const code = err?.error?.error;
        this.errorMessage = code || 'Pri registraciji je prišlo do napake.';
      },
    });
  }

  onCancel() {
    this.close.emit();
  }
}
