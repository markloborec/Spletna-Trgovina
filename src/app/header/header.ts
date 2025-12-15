import { Component, EventEmitter, Output } from '@angular/core';
import { Navbar } from "./navbar/navbar";
import { HeaderButtonContainer } from "./header-button-container/header-button-container";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Navbar, HeaderButtonContainer, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
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
