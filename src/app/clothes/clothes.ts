import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Clothing } from '../models/product';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { ProductInfo } from '../dialogs/product-info/product-info';

type BackendProduct = {
  id: string;
  name: string;
  price: number;

  imageUrl?: string;
  shortDescription?: string;
  longDescription?: string;
  isAvailable?: boolean;
  officialProductSite?: string;

  size?: Clothing['size'];
  gender?: 'male' | 'female' | 'unisex';
  color?: string;
  material?: string;
};

@Component({
  selector: 'app-clothes',
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule, ProductInfo],
  templateUrl: './clothes.html',
  styleUrl: './clothes.scss',
})
export class Clothes {
  constructor(private productService: ProductService, private cart: CartService) { }

  clothes: Clothing[] = [];
  selectedCloth: Clothing | null = null;

  filter = {
    size: '' as '' | Clothing['size'],
    gender: '' as '' | 'male' | 'female' | 'unisex',
    color: '',
    material: '',
    availability: '' as '' | 'available' | 'unavailable',
  };

  sortBy: 'name' | 'price' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.productService.getClothing(100).subscribe({
      next: (items) => {
        this.clothes = (items ?? []).map((p: any) => this.mapBackendToClothing(p as BackendProduct));
      },
      error: (err) => {
        console.error('CLOTHING ERROR:', err);
        this.clothes = [];
      },
    });
  }

  private mapBackendToClothing(p: BackendProduct): Clothing {
    const derived = this.deriveClothingSpecs(p);

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl ?? '',
      shortDescription: p.shortDescription ?? '',
      longDescription: p.longDescription ?? '',
      type: 'clothing',
      isAvailable: p.isAvailable ?? true,
      warrantyMonths: 24,
      officialProductSite: p.officialProductSite,

      // če backend pošlje, uporabimo; sicer fallback
      size: p.size ?? derived.size,
      gender: p.gender ?? derived.gender,
      color: p.color ?? derived.color,
      material: p.material ?? derived.material,
    };
  }

  private deriveClothingSpecs(p: BackendProduct): {
    size: Clothing['size'];
    gender: 'male' | 'female' | 'unisex';
    color: string;
    material: string;
  } {
    const name = (p.name || '').toLowerCase();

    // gender (heuristika iz imena)
    const gender: 'male' | 'female' | 'unisex' =
      name.includes('women') || name.includes('žensk') ? 'female'
        : name.includes('men') || name.includes('mošk') ? 'male'
          : 'unisex';

    // size (default)
    const size: Clothing['size'] = 'M';

    // material (default)
    const material =
      name.includes('merino') ? 'Merino volna'
        : name.includes('gore-tex') || name.includes('goretex') ? 'Gore-Tex'
          : 'Poliester';

    // color (default)
    const color =
      name.includes('black') || name.includes('črn') ? 'Črna'
        : name.includes('blue') || name.includes('moder') ? 'Modra'
          : '';

    return { size, gender, color, material };
  }

  get filteredAndSortedClothes(): Clothing[] {
    let result = [...this.clothes];

    if (this.filter.size) result = result.filter(c => c.size === this.filter.size);
    if (this.filter.gender) result = result.filter(c => c.gender === this.filter.gender);

    if (this.filter.color) {
      const q = this.filter.color.toLowerCase();
      result = result.filter(c => (c.color ?? '').toLowerCase().includes(q));
    }

    if (this.filter.material) {
      const q = this.filter.material.toLowerCase();
      result = result.filter(c => (c.material ?? '').toLowerCase().includes(q));
    }

    if (this.filter.availability === 'available') result = result.filter(c => c.isAvailable);
    else if (this.filter.availability === 'unavailable') result = result.filter(c => !c.isAvailable);

    result.sort((a, b) => {
      const valA = a[this.sortBy];
      const valB = b[this.sortBy];

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

  trackByClothesId = (_: number, item: Clothing) => item.id;

  onImageError(item: Clothing) {
    item.imageUrl = '';
  }

  addToCart(bike: Clothing) {
    if (!bike.isAvailable) return;
    this.cart.add(bike, 1);
  }

  openDetails(item: Clothing) {
    this.selectedCloth = item;
  }

  closeDetails() {
    this.selectedCloth = null;
  }
}
