import { Component, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Bicycle } from '../models/product';

type BackendProduct = {
  id: string;
  type: 'cycles' | 'equipment' | 'clothing';
  name: string;
  price: number;
  brand?: string;
  image_url?: string;
  short_description?: string;
  long_description?: string;
  inStock?: boolean;
};

@Component({
  selector: 'app-bikes',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule],
  templateUrl: './bikes.html',
  styleUrls: ['./bikes.scss'],
})

export class Bikes {
  /*bicycles: Bicycle[] = [
    {
      id: 'bike-1',
      name: 'Trailblazer 500',
      price: 1299.99,
      imageUrl: 'assets/images/bike-mtb-1.svg',
      description: 'Vzmeteno gorsko kolo za rekreativno in trail vožnjo.',
      type: 'cycles',
      isAvailable: true,
      warrantyMonths: 24,
      wheelSize: 29,
      frameMaterial: 'Aluminij',
      gearCount: 12,
      officialProductSite: 'https://www.decathlon.si/7447-gorska-kolesa',
    },
    {
      id: 'bike-2',
      name: 'City Rider Pro',
      price: 899,
      imageUrl: 'assets/images/bike-city-1.svg',
      description:
        'Udobno mestno kolo za vsakodnevno vožnjo v službo ali po opravkih.',
      type: 'cycles',
      isAvailable: true,
      warrantyMonths: 24,
      wheelSize: 28,
      frameMaterial: 'Jeklo',
      gearCount: 7,
    },
    {
      id: 'bike-3',
      name: 'Speedster Aero',
      price: 2199,
      imageUrl: 'assets/images/bike-road-1.svg',
      description: 'Lahko cestno kolo za daljše ture in treninge.',
      type: 'cycles',
      isAvailable: false,
      warrantyMonths: 36,
      wheelSize: 28,
      frameMaterial: 'Carbon',
      gearCount: 22,
      officialProductSite: 'https://www.11-11.si/en/categories/cycling/bikes',
    },
    {
      id: 'bike-3',
      name: 'Speedster Aero',
      price: 2199,
      imageUrl: 'assets/images/bike-road-1.svg',
      description: 'Lahko cestno kolo za daljše ture in treninge.',
      type: 'cycles',
      isAvailable: false,
      warrantyMonths: 36,
      wheelSize: 28,
      frameMaterial: 'Carbon',
      gearCount: 22,
      officialProductSite: 'https://www.11-11.si/en/categories/cycling/bikes',
    },
    {
      id: 'bike-3',
      name: 'Speedster Aero',
      price: 2199,
      imageUrl: 'assets/images/bike-road-1.svg',
      description: 'Lahko cestno kolo za daljše ture in treninge.',
      type: 'cycles',
      isAvailable: false,
      warrantyMonths: 36,
      wheelSize: 28,
      frameMaterial: 'Carbon',
      gearCount: 22,
      officialProductSite: 'https://www.11-11.si/en/categories/cycling/bikes',
    },
    {
      id: 'bike-3',
      name: 'Speedster Aero',
      price: 2199,
      imageUrl: 'assets/images/bike-road-1.svg',
      description: 'Lahko cestno kolo za daljše ture in treninge.',
      type: 'cycles',
      isAvailable: false,
      warrantyMonths: 36,
      wheelSize: 28,
      frameMaterial: 'Carbon',
      gearCount: 22,
      officialProductSite: 'https://www.11-11.si/en/categories/cycling/bikes',
    },
    {
      id: 'bike-3',
      name: 'Speedster Aero',
      price: 2199,
      imageUrl: 'assets/images/bike-road-1.svg',
      description: 'Lahko cestno kolo za daljše ture in treninge.',
      type: 'cycles',
      isAvailable: false,
      warrantyMonths: 36,
      wheelSize: 28,
      frameMaterial: 'Carbon',
      gearCount: 22,
      officialProductSite: 'https://www.11-11.si/en/categories/cycling/bikes',
    },
    {
      id: 'bike-3',
      name: 'Speedster Aero',
      price: 2199,
      imageUrl: 'assets/images/bike-road-1.svg',
      description: 'Lahko cestno kolo za daljše ture in treninge.',
      type: 'cycles',
      isAvailable: false,
      warrantyMonths: 36,
      wheelSize: 28,
      frameMaterial: 'Carbon',
      gearCount: 22,
      officialProductSite: 'https://www.11-11.si/en/categories/cycling/bikes',
    },
  ];*/

  private readonly http = inject(HttpClient);

  bicycles: Bicycle[] = [];

  filter = {
    wheelSize: '' as '' | 26 | 27.5 | 28 | 29,
    frameMaterial: '',
    availability: '' as '' | 'available' | 'unavailable',
    minGears: '' as '' | number,
  };

  // SORT
  sortBy: 'name' | 'price' | 'wheelSize' | 'gearCount' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.http
      .get<{ items: BackendProduct[] }>('/api/products?type=cycles&pageSize=100')
      .subscribe({
        next: (res) => {
          this.bicycles = (res.items ?? []).map((p) => this.mapBackendToBicycle(p));
        },
        error: (err) => {
          console.error('Failed loading bicycles', err);
          this.bicycles = [];
        },
      });
  }

  /**
   * Backend ti trenutno NE daje wheelSize/frameMaterial/gearCount,
   * zato naredimo "placeholder" vrednosti, da UI dela.
   * Kasneje, ko boš imel te atribute v bazi, to mapiranje odstraniš.
   */
  private mapBackendToBicycle(p: BackendProduct): Bicycle {
    const derived = this.deriveBikeSpecs(p);

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.image_url || '',
      shortDescription: p.short_description || '',
      longDescription: p.long_description || '',
      type: 'cycles',
      isAvailable: p.inStock ?? true,
      warrantyMonths: 24,
      officialProductSite: p.brand
        ? `https://www.google.com/search?q=${encodeURIComponent(`${p.brand} ${p.name}`)}`
        : undefined,

      wheelSize: derived.wheelSize,
      frameMaterial: derived.frameMaterial,
      gearCount: derived.gearCount,
    };
  }

  /**
   * Prosto pravilo, da dobiš realistične številke v UI, brez sprememb backenda.
   * (če nočeš tega, lahko nastaviš npr. 28 / "Aluminij" / 11 za vse)
   */
  private deriveBikeSpecs(p: BackendProduct): { wheelSize: 26 | 27.5 | 28 | 29; frameMaterial: string; gearCount: number } {
    const name = (p.name || '').toLowerCase();
    const price = Number(p.price || 0);

    // road bike
    if (name.includes('tarmac') || name.includes('roubaix') || name.includes('cest')) {
      return {
        wheelSize: 28,
        frameMaterial: price >= 6000 ? 'Carbon' : 'Aluminij',
        gearCount: price >= 3000 ? 22 : 18,
      };
    }

    // mtb
    if (name.includes('marlin') || name.includes('mtb') || name.includes('gors')) {
      return {
        wheelSize: 29,
        frameMaterial: 'Aluminij',
        gearCount: 12,
      };
    }

    // fallback
    return {
      wheelSize: 28,
      frameMaterial: 'Aluminij',
      gearCount: 11,
    };
  }

  get filteredAndSortedBicycles(): Bicycle[] {
    let result = [...this.bicycles];

    if (this.filter.wheelSize) {
      result = result.filter((b) => b.wheelSize === this.filter.wheelSize);
    }

    if (this.filter.frameMaterial) {
      const q = this.filter.frameMaterial.toLowerCase();
      result = result.filter((b) => b.frameMaterial.toLowerCase().includes(q));
    }

    if (this.filter.minGears !== '') {
      const min = Number(this.filter.minGears);
      if (!Number.isNaN(min)) {
        result = result.filter((b) => b.gearCount >= min);
      }
    }

    if (this.filter.availability === 'available') {
      result = result.filter((b) => b.isAvailable);
    } else if (this.filter.availability === 'unavailable') {
      result = result.filter((b) => !b.isAvailable);
    }

    result.sort((a, b) => {
      const valA = a[this.sortBy];
      const valB = b[this.sortBy];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      const numA = valA as number;
      const numB = valB as number;

      return this.sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return result;
  }

  trackByBikeId = (_: number, bike: Bicycle) => bike.id;

  onImageError(bike: Bicycle) {
    bike.imageUrl = '';
  }
}
