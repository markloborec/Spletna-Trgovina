import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-header-button-container',
  imports: [ CommonModule, FontAwesomeModule],
  templateUrl: './header-button-container.html',
  styleUrls: ['./header-button-container.scss'],
  standalone: true
})
export class HeaderButtonContainer {
  faUser = faUser;
  faShoppingCart = faShoppingCart;
}
