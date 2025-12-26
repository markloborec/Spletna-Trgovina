import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Categories } from './categories/categories';

type AppRoute = 'bikes' | 'equipment' | 'clothes' | 'contact' | '';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, Categories],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss'],
})
export class Homepage {
  constructor(private router: Router) { }

  go(path: AppRoute) {
    this.router.navigate([path]);
  }
}
