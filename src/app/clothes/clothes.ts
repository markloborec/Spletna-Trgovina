import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { Clothing } from '../models/product';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clothes',
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule],
  templateUrl: './clothes.html',
  styleUrl: './clothes.scss',
})
export class Clothes {
  clothes: Clothing[] = [
    {
      id: 'shirt-1',
      name: 'MTB Trail Air Jersey',
      price: 39.99,
      imageUrl: 'assets/images/clothing-shirt-1.svg',
      description: 'Lahka in zračna MTB majica, hitro sušeč material.',
      type: 'clothing',
      isAvailable: true,
      warrantyMonths: 24,
      size: 'M',
      gender: 'unisex',
      material: 'Poliester',
      color: 'Črna/Zelena',
      officialProductSite: 'https://www.decathlon.si/',
    },
    {
      id: 'shirt-2',
      name: 'Road Aero Jersey',
      price: 69.9,
      imageUrl: 'assets/images/clothing-shirt-2.svg',
      description: 'Oprijeta cestna majica, idealna za dolge ture v vročini.',
      type: 'clothing',
      isAvailable: true,
      warrantyMonths: 24,
      size: 'L',
      gender: 'male',
      material: 'Elastan + Poliester',
      color: 'Rdeča',
    },
    {
      id: 'jacket-1',
      name: 'All Weather Wind Jacket',
      price: 119.0,
      imageUrl: 'assets/images/clothing-jacket.svg',
      description: 'Vodoodporna jakna za celotno kolesarsko sezono.',
      type: 'clothing',
      isAvailable: false,
      warrantyMonths: 36,
      size: 'XL',
      gender: 'unisex',
      material: 'Membrana',
      color: 'Modra',
      officialProductSite: 'https://www.11-11.si/',
    },
  ];

  filter = {
    size: '' as '' | Clothing['size'],
    gender: '' as '' | 'male' | 'female' | 'unisex',
    color: '',
    material: '',
    availability: '' as '' | 'available' | 'unavailable',
  };

  // SORT
  sortBy: 'name' | 'price' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  get filteredAndSortedClothes(): Clothing[] {
    let result = [...this.clothes];

    if (this.filter.size) {
      result = result.filter(c => c.size === this.filter.size);
    }

    if (this.filter.gender) {
      result = result.filter(c => c.gender === this.filter.gender);
    }

    if (this.filter.color) {
      const q = this.filter.color.toLowerCase();
      result = result.filter(c => c.color?.toLowerCase().includes(q));
    }

    if (this.filter.material) {
      const q = this.filter.material.toLowerCase();
      result = result.filter(c => c.material?.toLowerCase().includes(q));
    }

    if (this.filter.availability === 'available') {
      result = result.filter(c => c.isAvailable);
    } else if (this.filter.availability === 'unavailable') {
      result = result.filter(c => !c.isAvailable);
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

  trackByClothesId = (_: number, item: Clothing) => item.id;

  onImageError(item: Clothing) {
    item.imageUrl = '';
  }
}
