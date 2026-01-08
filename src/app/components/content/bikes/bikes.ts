import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bicycle } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { ProductInfo } from '../../dialogs/product-info/product-info';

type BackendProduct = {
  id?: string;
  _id?: string;

  name: string;
  price: number;

  // backend lahko pošilja camel ali snake:
  imageUrl?: string;
  image_url?: string;

  shortDescription?: string;
  short_description?: string;

  longDescription?: string;
  long_description?: string;

  isAvailable?: boolean;
  inStock?: boolean;

  officialProductSite?: string;
  official_product_site?: string;
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
        this.logPriceStats(this.bicycles);
      },
      error: (err) => {
        console.error('Failed loading bicycles', err);
        this.bicycles = [];
      },
    });
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  onCardKeydown(event: KeyboardEvent, bike: any) {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.openDetails(bike);
    }
  }

  getBikeImageAlt(bike: Bicycle): string {
    const name = (bike?.name || '').trim();
    if (!name) return 'Fotografija kolesa';
    const availability = bike.isAvailable ? 'na zalogi' : 'ni na zalogi';
    return `Fotografija kolesa: ${name} (${availability})`;
  }

  private getImageUrl(p: BackendProduct): string {
    const url = (p.imageUrl ?? (p as any).image_url ?? '').toString().trim();
    return url;
  }

  private getShortDescription(p: BackendProduct): string {
    return (p.shortDescription ?? (p as any).short_description ?? '').toString();
  }

  private getLongDescription(p: BackendProduct): string {
    return (p.longDescription ?? (p as any).long_description ?? '').toString();
  }

  private getIsAvailable(p: BackendProduct): boolean {
    // backend v seed uporablja inStock
    const val = p.isAvailable ?? (p as any).inStock;
    return typeof val === 'boolean' ? val : true;
  }

  private getOfficialSite(p: BackendProduct): string | undefined {
    return (p.officialProductSite ?? (p as any).official_product_site) as any;
  }

  private mapBackendToBicycle(p: BackendProduct): Bicycle {
    const derived = this.deriveBikeSpecs(p);
    const id = String(p.id ?? (p as any)._id ?? '');

    return {
      id,
      name: p.name,
      price: Number(p.price ?? 0),

      imageUrl: this.getImageUrl(p),
      shortDescription: this.getShortDescription(p),
      longDescription: this.getLongDescription(p),

      type: 'cycles',
      isAvailable: this.getIsAvailable(p),

      warrantyMonths: 24,
      officialProductSite: this.getOfficialSite(p),

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
      return { wheelSize: 29, frameMaterial: 'Aluminij', gearCount: 12 };
    }

    return { wheelSize: 28, frameMaterial: 'Aluminij', gearCount: 11 };
  }

  get filteredAndSortedBicycles(): Bicycle[] {
    let result = [...this.bicycles];

    if (this.filter.wheelSize) result = result.filter((b) => b.wheelSize === this.filter.wheelSize);

    if (this.filter.frameMaterial) {
      const q = this.filter.frameMaterial.toLowerCase();
      result = result.filter((b) => b.frameMaterial.toLowerCase().includes(q));
    }

    if (this.filter.minGears !== '') {
      const min = Number(this.filter.minGears);
      if (!Number.isNaN(min)) result = result.filter((b) => b.gearCount >= min);
    }

    if (this.filter.availability === 'available') result = result.filter((b) => b.isAvailable);
    else if (this.filter.availability === 'unavailable') result = result.filter((b) => !b.isAvailable);

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

  openDetailsFromCard(bike: any, event: Event) {
    const target = event.target as HTMLElement | null;
    if (target && (target.closest('button') || target.closest('a'))) return;
    this.openDetails(bike);
  }

  closeDetails() {
    this.selectedBike = null;
  }

  private logPriceStats(list: Bicycle[]) {
    const prices = (list ?? [])
      .map((b) => Number(b.price))
      .filter((p) => Number.isFinite(p));

    if (prices.length === 0) {
      console.log('[Bikes] Price stats: no valid prices');
      return;
    }

    const sum = prices.reduce((acc, p) => acc + p, 0);
    const avg = sum / prices.length;
    const max = Math.max(...prices);
    const min = Math.min(...prices);

    console.log('[Bikes] Price stats', {
      count: prices.length,
      avg: Number(avg.toFixed(2)),
      max,
      min,
    });
  }
}
