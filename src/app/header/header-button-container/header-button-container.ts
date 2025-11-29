import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-button-container',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './header-button-container.html',
  styleUrls: ['./header-button-container.scss'],
  standalone: true
})
export class HeaderButtonContainer {
  @Output() registerClick = new EventEmitter<void>();
  @Output() loginClick = new EventEmitter<void>();
  faUser = faUser;
  faShoppingCart = faShoppingCart;

  constructor(private elementRef: ElementRef, private router: Router) { }

  isUserMenuOpen = false;
  isCartMenuOpen = false;
  isLoggedIn = false;

  OpenUser() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isCartMenuOpen = false;
  }

  OpenCard() {
    this.isCartMenuOpen = !this.isCartMenuOpen;
    this.isUserMenuOpen = false;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
    this.isCartMenuOpen = false;
  }

  openRegistration() {
    this.closeUserMenu();
    this.registerClick.emit();
    //this.router.navigate(['/registration']);
  }

  openLogin() {
    this.closeUserMenu();
    this.loginClick.emit()
    //this.router.navigate(['/login']);
  }

  /* ZAPIRANJE OB KLIKU IZVEN */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isUserMenuOpen = false;
      this.isCartMenuOpen = false;
    }
  } UserMenuOpen = false; // zapre user meni
}

