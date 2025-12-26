import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type CategoryRoute = 'bikes' | 'equipment' | 'clothes';

type CategoryCard = {
  title: string;
  description: string;
  linkText: string;
  route: CategoryRoute;
};

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
})
export class Categories {
  constructor(private router: Router) { }

  categories: CategoryCard[] = [
    {
      title: 'Kolesa',
      description: 'Gorska, cestna in mestna kolesa za vse terene in stile vožnje.',
      linkText: 'Poglej kolesa',
      route: 'bikes',
    },
    {
      title: 'Oprema',
      description: 'Čelade, luči, ključavnice, ščitniki in vse, kar potrebuješ na poti.',
      linkText: 'Poglej opremo',
      route: 'equipment',
    },
    {
      title: 'Oblačila',
      description: 'Funkcionalna športna oblačila za udobno in varno vožnjo.',
      linkText: 'Poglej oblačila',
      route: 'clothes',
    },
  ];

  go(route: CategoryRoute) {
    this.router.navigate([route]); // -> /bikes, /equipment, /clothes
  }
}
