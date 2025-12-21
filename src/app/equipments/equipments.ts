import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipment } from '../models/product';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { ProductInfo } from '../dialogs/product-info/product-info';

@Component({
  selector: 'app-equipments',
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule, ProductInfo],
  templateUrl: './equipments.html',
  styleUrl: './equipments.scss',
})
export class Equipments {
  constructor(private productService: ProductService, private cart: CartService) { }

  equipments: Equipment[] = [];

  filter = {
    brand: '',
    availability: '' as '' | 'available' | 'unavailable',
    material: '',
    compatibility: '',
  };

  // SORT
  sortBy: 'name' | 'price' | 'weight' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // MODAL STATE
  selectedEquipment: Equipment | null = null;

  ngOnInit(): void {
    this.productService.getEquipment(100).subscribe({
      next: (items) => (this.equipments = items ?? []),
      error: (err) => {
        console.error('PRODUCTS ERROR:', err);
        this.equipments = [];
      },
    });
  }

  openDetails(item: Equipment) {
    this.selectedEquipment = item;
  }

  closeDetails() {
    this.selectedEquipment = null;
  }

  get filteredAndSortedEquipments(): Equipment[] {
    let result = [...this.equipments];

    if (this.filter.brand) {
      const q = this.filter.brand.toLowerCase();
      result = result.filter((e) => (e.brand ?? '').toLowerCase().includes(q));
    }

    if (this.filter.compatibility) {
      result = result.filter((e) => (e.compatibility ?? []).includes(this.filter.compatibility));
    }

    if (this.filter.material) {
      const q = this.filter.material.toLowerCase();
      result = result.filter((e) => (e.material ?? '').toLowerCase().includes(q));
    }

    if (this.filter.availability === 'available') result = result.filter((e) => e.isAvailable);
    if (this.filter.availability === 'unavailable') result = result.filter((e) => !e.isAvailable);

    result.sort((a, b) => {
      if (this.sortBy === 'name') {
        const aa = (a.name ?? '').toString();
        const bb = (b.name ?? '').toString();
        return this.sortDirection === 'asc' ? aa.localeCompare(bb) : bb.localeCompare(aa);
      }

      const numA = Number((a as any)[this.sortBy] ?? 0);
      const numB = Number((b as any)[this.sortBy] ?? 0);
      return this.sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return result;
  }

  trackByEquipmentId = (_: number, eq: Equipment) => eq.id;

  onImageError(eq: Equipment) {
    eq.imageUrl = '';
  }

  addToCart(item: Equipment) {
    if (!item.isAvailable) return;
    this.cart.add(item, 1);
  }
}
