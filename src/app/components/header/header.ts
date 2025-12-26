import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from './navbar/navbar';
import { HeaderButtonContainer } from './header-button-container/header-button-container';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, Navbar, HeaderButtonContainer],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  @Output() registerClick = new EventEmitter<void>();
  @Output() loginClick = new EventEmitter<void>();

  onRegisterClick() {
    this.registerClick.emit();
  }

  onLoginClick() {
    this.loginClick.emit();
  }
}
