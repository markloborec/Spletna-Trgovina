import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login implements AfterViewInit {
  @Output() close = new EventEmitter<void>();

  @ViewChild('dialogTitle', { static: false }) dialogTitle?: ElementRef<HTMLElement>;
  @ViewChild('firstField', { static: false }) firstField?: ElementRef<HTMLInputElement>;

  view: 'login' | 'forgot' | 'reset' = 'login';

  // ids za aria-labelledby/aria-describedby
  titleId = 'login-dialog-title';
  descId = 'login-dialog-desc';

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

  ngAfterViewInit(): void {
    // fokus na naslov ali prvo polje
    setTimeout(() => {
      (this.firstField?.nativeElement ?? this.dialogTitle?.nativeElement)?.focus();
    }, 0);
  }

  private resetMsgs() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  onBackdropClick(_: MouseEvent) {
    // klik zunaj dialoga
    this.close.emit();
  }

  onKeydown(event: KeyboardEvent) {
    // ESC zapre
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close.emit();
      return;
    }

    // fokus-trap (Tab)
    if (event.key !== 'Tab') return;

    const dialog = document.querySelector('.login-dialog') as HTMLElement | null;
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

  private focusFirstFieldSoon() {
    setTimeout(() => {
      (this.firstField?.nativeElement ?? this.dialogTitle?.nativeElement)?.focus();
    }, 0);
  }

  onSubmit() {
    if (this.view !== 'login') return;

    this.resetMsgs();

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
      this.resetMsgs();
      this.focusFirstFieldSoon();
      return;
    }
    this.close.emit();
  }

  onForgotPassword() {
    this.resetMsgs();
    this.forgotData.email = this.formData.email || '';
    this.view = 'forgot';
    this.focusFirstFieldSoon();
  }

  submitForgotPassword() {
    this.resetMsgs();

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
          this.focusFirstFieldSoon();
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
    this.resetMsgs();

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
        this.focusFirstFieldSoon();
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
