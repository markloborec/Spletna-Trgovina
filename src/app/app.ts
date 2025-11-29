import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { Homepage } from "./homepage/homepage";
import { Footer } from "./footer/footer";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { Registration } from "./dialogs/registration/registration";
import { Login } from "./dialogs/login/login";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Header, Homepage, Footer, FontAwesomeModule, Registration, Login],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'sports-store';
  showRegistration = false;
  showLogin = false;

  onRegisterClick() {
    this.showRegistration = true;
  }

  onRegistrationClose() {
    this.showRegistration = false;
  }

  onLoginClick() {
    this.showLogin = true;
  }
  onLoginClose() {
    this.showLogin = false;
  }
}
