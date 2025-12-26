import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Registration } from "./components/dialogs/registration/registration";
import { Login } from "./components/dialogs/login/login";
import { routeAnimations } from './route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Header, Footer, FontAwesomeModule, Registration, Login],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [routeAnimations],
})
export class App {
  protected readonly title = 'sports-store';
  showRegistration = false;
  showLogin = false;

  routeKey = 0;

  onRouteActivate() {
    this.routeKey++;
  }

  onRouteDeactivate() { }

  onRegisterClick() { this.showRegistration = true; }
  onRegistrationClose() { this.showRegistration = false; }

  onLoginClick() { this.showLogin = true; }
  onLoginClose() { this.showLogin = false; }
}
