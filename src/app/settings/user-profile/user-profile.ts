import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = false;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  private originalProfile?: UserProfile;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profile = { ...profile };
        this.originalProfile = { ...profile };
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Profil uporabnika ni bilo mogoče naložiti.';
      },
    });
  }

  onEdit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isEditing = true;
  }

  onCancelEdit() {
    if (this.originalProfile) {
      this.profile = { ...this.originalProfile };
    }
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSave() {
    if (!this.profile) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSaving = true;

    this.authService.updateProfile(this.profile).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.isEditing = false;
        this.profile = { ...updated };
        this.originalProfile = { ...updated };
        this.successMessage = 'Profil uspešno posodobljen.';
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.errorMessage = 'Pri shranjevanju profila je prišlo do napake.';
      },
    });
  }
}