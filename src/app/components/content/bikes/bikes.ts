import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bicycle, Equipment } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { ProductInfo } from '../../dialogs/product-info/product-info';

type BackendProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  shortDescription?: string;
  longDescription?: string;
  isAvailable?: boolean;
  officialProductSite?: string;
};

@Component({
  selector: 'app-bikes',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule, ProductInfo],
  templateUrl: './bikes.html',
  styleUrls: ['./bikes.scss'],
})
export class Bikes {
  constructor(private productService: ProductService, private cart: CartService) { }

  bicycles: Bicycle[] = [];
  selectedBike: any = null;

  filter = {
    wheelSize: '' as '' | 26 | 27.5 | 28 | 29,
    frameMaterial: '',
    availability: '' as '' | 'available' | 'unavailable',
    minGears: '' as '' | number,
  };

  sortBy: 'name' | 'price' | 'wheelSize' | 'gearCount' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.productService.getBicycles(100).subscribe({
      next: (items) => {
        this.bicycles = (items ?? []).map((p: any) => this.mapBackendToBicycle(p as BackendProduct));
      },
      error: (err) => {
        console.error('Failed loading bicycles', err);
        this.bicycles = [];
      },
    });
  }

  private mapBackendToBicycle(p: BackendProduct): Bicycle {
    const derived = this.deriveBikeSpecs(p);

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl ?? '',
      shortDescription: p.shortDescription ?? '',
      longDescription: p.longDescription ?? '',
      type: 'cycles',
      isAvailable: p.isAvailable ?? true,
      warrantyMonths: 24,
      officialProductSite: p.officialProductSite,

      wheelSize: derived.wheelSize,
      frameMaterial: derived.frameMaterial,
      gearCount: derived.gearCount,
    };
  }

  private deriveBikeSpecs(p: BackendProduct): {
    wheelSize: 26 | 27.5 | 28 | 29;
    frameMaterial: string;
    gearCount: number;
  } {
    const name = (p.name || '').toLowerCase();
    const price = Number(p.price || 0);

    if (name.includes('tarmac') || name.includes('roubaix') || name.includes('cest')) {
      return {
        wheelSize: 28,
        frameMaterial: price >= 6000 ? 'Carbon' : 'Aluminij',
        gearCount: price >= 3000 ? 22 : 18,
      };
    }

    if (name.includes('marlin') || name.includes('mtb') || name.includes('gors')) {
      return {
        wheelSize: 29,
        frameMaterial: 'Aluminij',
        gearCount: 12,
      };
    }

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
        return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return this.sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

    return result;
  }

  trackByBikeId = (_: number, bike: Bicycle) => bike.id;

  onImageError(bike: Bicycle) {
    bike.imageUrl = '';
  }

  addToCart(bike: Bicycle) {
    if (!bike.isAvailable) return;
    this.cart.add(bike, 1);
  }

  openDetails(bike: any) {
    this.selectedBike = bike;
  }

  closeDetails() {
    this.selectedBike = null;
  }
}
