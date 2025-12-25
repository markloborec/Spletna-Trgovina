import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../../../models/user';
import { UserService } from '../../../../services/user.service';

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

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  private resetMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadProfile(): void {
    this.resetMessages();
    this.loading = true;

    this.userService.getProfile().subscribe({
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

  onEdit(): void {
    this.resetMessages();
    this.isEditing = true;
  }

  onCancelEdit(): void {
    this.resetMessages();

    if (this.originalProfile) {
      this.profile = { ...this.originalProfile };
    }

    this.isEditing = false;
  }

  onSave(): void {
    if (!this.profile) return;

    this.resetMessages();
    this.isSaving = true;

    this.userService.updateProfile(this.profile).subscribe({
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
