import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, } from '@angular/common';
import { Equipment } from '../models/product';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-equipments',
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule],
  templateUrl: './equipments.html',
  styleUrl: './equipments.scss',
})
export class Equipments {
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (items) => console.log('BACKEND PRODUCTS:', items),
      error: (err) => console.error('PRODUCTS ERROR:', err),
    });
  }

  equipments: Equipment[] = [
    /*{
      id: 'helmet-1',
      name: 'MTB Vetra Flow čelada',
      price: 69.99,
      imageUrl: 'assets/images/equipment-helmet.svg',
      description: 'Lahka in dobro prezračevana čelada za gorsko kolesarjenje.',
      type: 'equipment',
      isAvailable: true,
      warrantyMonths: 24,
      compatibility: ['MTB'],
      weight: 320,
      material: 'EPS + Polycarbonate',
      brand: 'TrailSafe',
      officialProductSite: 'https://www.decathlon.si',
    },
    {
      id: 'light-1',
      name: 'Road Pro LED luč',
      price: 39.5,
      imageUrl: 'assets/images/equipment-light.svg',
      description: 'Močna sprednja LED luč z USB polnjenjem.',
      type: 'equipment',
      isAvailable: true,
      warrantyMonths: 24,
      compatibility: ['Road', 'City'],
      weight: 150,
      material: 'Aluminij',
      brand: 'NightRide',
    },
    {
      id: 'bottle-1',
      name: 'Bidon Thermo 750ml',
      price: 19.9,
      imageUrl: 'assets/images/equipment-bottle.svg',
      description: 'Izotermični bidon, ki drži temperaturo 3–5 ur.',
      type: 'equipment',
      isAvailable: false,
      warrantyMonths: 12,
      compatibility: ['MTB', 'Road', 'Gravel'],
      material: 'BPA Free Plastic',
      brand: 'CycleGear',
      officialProductSite: 'https://www.11-11.si',
    },*/
  ];
  filter = {
    brand: '',
    availability: '' as '' | 'available' | 'unavailable',
    material: '',
    compatibility: '',
  };

  // SORT
  sortBy = 'name'; // 'price' | 'weight'
  sortDirection: 'asc' | 'desc' = 'asc';

  get filteredAndSortedEquipments(): Equipment[] {
    let result = [...this.equipments];

    if (this.filter.brand)
      result = result.filter(e => e.brand?.toLowerCase().includes(this.filter.brand.toLowerCase()));

    if (this.filter.compatibility)
      result = result.filter(e => e.compatibility.includes(this.filter.compatibility));

    if (this.filter.material)
      result = result.filter(e => e.material?.toLowerCase().includes(this.filter.material.toLowerCase()));

    if (this.filter.availability === 'available')
      result = result.filter(e => e.isAvailable);
    if (this.filter.availability === 'unavailable')
      result = result.filter(e => !e.isAvailable);

    // Sort
    result.sort((a, b) => {
      const valA = a[this.sortBy as keyof Equipment] ?? 0;
      const valB = b[this.sortBy as keyof Equipment] ?? 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return this.sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

    return result;
  }

  trackByEquipmentId = (_: number, eq: Equipment) => eq.id;

  onImageError(eq: Equipment) {
    eq.imageUrl = '';
  }
}
