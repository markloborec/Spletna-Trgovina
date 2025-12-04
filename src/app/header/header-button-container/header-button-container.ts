import { Component, ElementRef, EventEmitter, HostListener, Output, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-button-container',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './header-button-container.html',
  styleUrls: ['./header-button-container.scss'],
})
export class HeaderButtonContainer {
  @Output() registerClick = new EventEmitter<void>();
  @Output() loginClick = new EventEmitter<void>();

  faUser = faUser;
  faShoppingCart = faShoppingCart;

  isUserMenuOpen = false;
  isCartMenuOpen = false;
  isLangMenuOpen = false;
  isLoggedIn = false;

  constructor(private elementRef: ElementRef,
    private router: Router,) { }

  OpenUser() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isCartMenuOpen = false;
    this.isLangMenuOpen = false;
  }

  OpenCard() {
    this.isCartMenuOpen = !this.isCartMenuOpen;
    this.isUserMenuOpen = false;
    this.isLangMenuOpen = false;
  }

  toggleLanguageMenu() {
    this.isLangMenuOpen = !this.isLangMenuOpen;
    this.isUserMenuOpen = false;
    this.isCartMenuOpen = false;
  }

  closeAllMenus() {
    this.isUserMenuOpen = false;
    this.isCartMenuOpen = false;
    this.isLangMenuOpen = false;
  }

  openRegistration() {
    this.closeAllMenus();
    this.registerClick.emit();
  }

  openLogin() {
    this.closeAllMenus();
    this.loginClick.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.closeAllMenus();
    }
  }

  routeToUserProfile() {
    this.router.navigate(['/settings/user-profile']);
    this.closeAllMenus();
  }
  currentLang: 'sl' | 'en' = 'sl';

  toggleLanguage() {
    const googleCombo = document.querySelector('select.goog-te-combo') as HTMLSelectElement | null;
    if (!googleCombo) {
      console.warn('Google translate not initialized yet');
      return;
    }

    this.currentLang = this.currentLang === 'sl' ? 'en' : 'sl';
    googleCombo.value = this.currentLang;
    googleCombo.dispatchEvent(new Event('change'));
  }
}
