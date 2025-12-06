import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class Navbar {
  menuOpen = false;
  faBars = faBars;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    // Samo za mobilne naprave zapremo meni
    if (window.innerWidth <= 800) {
      this.menuOpen = false;
    }
  }
}

