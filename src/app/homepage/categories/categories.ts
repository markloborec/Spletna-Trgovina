import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  imports: [CommonModule,],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  categories = [
    {
      title: 'Kolesa',
      description: 'Gorska, cestna in mestna kolesa za vse terene in stile vožnje.',
      linkText: 'Poglej kolesa',
      href: '#'
    },
    {
      title: 'Oprema',
      description: 'Čelade, luči, ključavnice, ščitniki in vse, kar potrebuješ na poti.',
      linkText: 'Poglej opremo',
      href: '#'
    },
    {
      title: 'Oblačila',
      description: 'Funkcionalna športna oblačila za udobno in varno vožnjo.',
      linkText: 'Poglej oblačila',
      href: '#'
    }
  ];
}
