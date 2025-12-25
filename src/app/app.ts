import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { Registration } from "./components/dialogs/registration/registration";
import { Login } from "./components/dialogs/login/login";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Header, Footer, FontAwesomeModule, Registration, Login,],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'sports-store';
  showRegistration = false;
  showLogin = false;

  ngOnInit(): void {
  }

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
