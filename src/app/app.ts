import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { Homepage } from "./homepage/homepage";
import { Footer } from "./footer/footer";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { Registration } from "./dialogs/registration/registration";
import { Login } from "./dialogs/login/login";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Header, Homepage, Footer, FontAwesomeModule, Registration, Login, TranslateModule,],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'sports-store';
  showRegistration = false;
  showLogin = false;

  constructor(private translate: TranslateService) {
    this.initTranslations();
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
  private initTranslations() {
    this.translate.addLangs(['sl', 'en']);
    this.translate.setDefaultLang('sl');

    // slovenski prevodi
    this.translate.setTranslation('sl', {
      HEADER: {
        TITLE: 'Moja aplikacija',
        LOGIN: 'Prijava',
        REGISTER: 'Registracija',
        LANG: 'Jezik'
      },
      LOGIN: {
        TITLE: 'Prijava',
        EMAIL: 'E-pošta',
        PASSWORD: 'Geslo',
        SUBMIT: 'Prijavi se'
      },
      REGISTER: {
        TITLE: 'Ustvari račun',
        FIRST_NAME: 'Ime',
        LAST_NAME: 'Priimek',
        EMAIL: 'E-pošta',
        PASSWORD: 'Geslo',
        SUBMIT: 'Registriraj se'
      }
      // sem dodaš vse ostale tekste, ki jih imaš v appu
    }, true);

    // angleški prevodi
    this.translate.setTranslation('en', {
      HEADER: {
        TITLE: 'My application',
        LOGIN: 'Login',
        REGISTER: 'Register',
        LANG: 'Language'
      },
      LOGIN: {
        TITLE: 'Login',
        EMAIL: 'Email',
        PASSWORD: 'Password',
        SUBMIT: 'Sign in'
      },
      REGISTER: {
        TITLE: 'Create account',
        FIRST_NAME: 'First name',
        LAST_NAME: 'Last name',
        EMAIL: 'Email',
        PASSWORD: 'Password',
        SUBMIT: 'Sign up'
      }
      // isto – vse ostale tekste
    }, true);

    this.translate.use('sl'); // začetni jezik
  }
}
