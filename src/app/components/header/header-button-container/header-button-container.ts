import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header-button-container',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
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

  isLoggedIn = !!localStorage.getItem('auth_token');

  currentLang: 'sl' | 'en' | 'de' = 'sl';

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    public cart: CartService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((v) => (this.isLoggedIn = v));

    // ob refreshu nastavi jezik iz cookie-ja
    const gt = this.getCookie('googtrans');
    if (gt?.endsWith('/en')) this.currentLang = 'en';
    else if (gt?.endsWith('/de')) this.currentLang = 'de';
    else this.currentLang = 'sl';
  }

  /** WCAG: tipkovnica (Enter/Space) na ikonah */
  onIconKeydown(event: KeyboardEvent, which: 'user' | 'cart') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (which === 'user') this.toggleUserMenu();
      else this.toggleCartMenu();
    }
  }

  /** Escape zapre menije (če dodaš (keydown.escape)="closeAllMenus()" na wrapper) */
  closeAllMenus() {
    this.isUserMenuOpen = false;
    this.isCartMenuOpen = false;
    this.isLangMenuOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isCartMenuOpen = false;
    this.isLangMenuOpen = false;
  }

  toggleCartMenu() {
    this.isCartMenuOpen = !this.isCartMenuOpen;
    this.isUserMenuOpen = false;
    this.isLangMenuOpen = false;
  }

  // Backward compatibility: če imaš še vedno kje v HTML OpenUser/OpenCard
  OpenUser() {
    this.toggleUserMenu();
  }

  OpenCard() {
    this.toggleCartMenu();
  }

  goToCart() {
    this.router.navigate(['/cart']);
    this.closeAllMenus();
  }

  openRegistration() {
    this.closeAllMenus();
    this.registerClick.emit();
  }

  openLogin() {
    this.closeAllMenus();
    this.loginClick.emit();
  }

  logout() {
    this.authService.logout();
    this.closeAllMenus();
    this.router.navigate(['/']);
  }

  routeToUserProfile() {
    this.router.navigate(['/settings/user-profile']);
    this.closeAllMenus();
  }

  routeToOrderHistory() {
    this.router.navigate(['/orderHistory']);
    this.closeAllMenus();
  }

  toggleLanguage() {
    const order: Array<'sl' | 'en' | 'de'> = ['sl', 'en', 'de'];
    const idx = order.indexOf(this.currentLang);
    const next = order[(idx + 1) % order.length];

    this.currentLang = next;

    if (next === 'sl') {
      this.deleteGoogTransCookie();
    } else {
      // pageLanguage = sl
      this.setGoogTransCookie(`/sl/${next}`);
    }

    // reset Google Translate stanja
    window.location.reload();
  }

  private setGoogTransCookie(value: string) {
    document.cookie = `googtrans=${encodeURIComponent(value)}; path=/`;
  }

  private deleteGoogTransCookie() {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) this.closeAllMenus();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeAllMenus();
  }
}
