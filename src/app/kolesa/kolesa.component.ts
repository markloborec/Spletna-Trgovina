import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // DODAJTE
import { RouterLink } from '@angular/router'; // DODAJTE

@Component({
  selector: 'app-kolesa',
  imports: [CommonModule, RouterLink], // DODAJTE
  templateUrl: './kolesa.component.html',
  styleUrl: './kolesa.component.scss'
})
export class KolesaComponent {

}