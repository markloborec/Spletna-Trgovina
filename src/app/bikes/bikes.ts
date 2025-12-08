import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { Bicycle } from '../models/product';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bikes',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule],
  templateUrl: './bikes.html',
  styleUrls: ['./bikes.scss'],
})
export class Bikes {
  bicycles: Bicycle[] = [
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
  ];

  filter = {
    wheelSize: '' as '' | 26 | 27.5 | 28 | 29,
    frameMaterial: '',
    availability: '' as '' | 'available' | 'unavailable',
    minGears: '' as '' | number,
  };

  // SORT
  sortBy: 'name' | 'price' | 'wheelSize' | 'gearCount' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  get filteredAndSortedBicycles(): Bicycle[] {
    let result = [...this.bicycles];

    if (this.filter.wheelSize) {
      result = result.filter(b => b.wheelSize === this.filter.wheelSize);
    }

    if (this.filter.frameMaterial) {
      const q = this.filter.frameMaterial.toLowerCase();
      result = result.filter(b => b.frameMaterial.toLowerCase().includes(q));
    }

    if (this.filter.minGears !== '') {
      const min = Number(this.filter.minGears);
      if (!Number.isNaN(min)) {
        result = result.filter(b => b.gearCount >= min);
      }
    }

    if (this.filter.availability === 'available') {
      result = result.filter(b => b.isAvailable);
    } else if (this.filter.availability === 'unavailable') {
      result = result.filter(b => !b.isAvailable);
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
