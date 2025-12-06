import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; // DODAJTE
@Component({
  selector: 'app-kontakt',
  imports: [CommonModule, FormsModule],
  templateUrl: './kontakt.component.html',
  styleUrls: ['./kontakt.component.scss']
})
export class KontaktComponent {
  kontaktData = {
    ime: '',
    email: '',
    telefon: '',
    zadeva: '',
    sporocilo: '',
    novice: false
  };

  submitting = false;
  submitted = false;

  onSubmit() {
    if (this.kontaktData.ime && this.kontaktData.email && this.kontaktData.sporocilo) {
      this.submitting = true;
      
      // Simulacija pošiljanja podatkov
      setTimeout(() => {
        console.log('Kontaktni podatki poslani:', this.kontaktData);
        
        this.submitting = false;
        this.submitted = true;
        
        // Resetiranje forme po 5 sekundah
        setTimeout(() => {
          this.kontaktData = {
            ime: '',
            email: '',
            telefon: '',
            zadeva: '',
            sporocilo: '',
            novice: false
          };
          this.submitted = false;
        }, 5000);
      }, 1500);
    }
  }
}