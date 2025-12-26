import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Clothing } from '../../../models/product';
import { ProductInfo } from '../../dialogs/product-info/product-info';
import { CartService } from '../../../services/cart.service';
import { ProductService } from '../../../services/product.service';

type BackendProduct = {
  id?: string;
  _id?: string;

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

  ratingAvg?: number;
  ratingCount?: number;
};

@Component({
  selector: 'app-clothes',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule, ProductInfo],
  templateUrl: './clothes.html',
  styleUrls: ['./clothes.scss'], // <-- FIX: styleUrl -> styleUrls
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

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  /** Tipkovnična podpora za kartico: Enter / Space odpre podrobnosti */
  onCardKeydown(event: KeyboardEvent, item: Clothing) {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.openDetails(item);
    }
  }

  /** Bolj opisni ALT (WAVE opozori, če je alt generičen ali manjka) */
  getClothesImageAlt(item: Clothing): string {
    const name = (item?.name || '').trim();
    if (!name) return 'Fotografija oblačila';
    const availability = item.isAvailable ? 'na zalogi' : 'ni na zalogi';
    return `Fotografija oblačila: ${name} (${availability})`;
  }

  private mapBackendToClothing(p: BackendProduct): Clothing {
    const derived = this.deriveClothingSpecs(p);

    const id = String(p.id ?? p._id ?? '');
    if (!id) {
      console.warn('Clothing item WITHOUT id/_id from backend:', p);
    }

    return {
      id,
      name: p.name,
      price: Number(p.price ?? 0),
      imageUrl: p.imageUrl ?? '',
      shortDescription: p.shortDescription ?? '',
      longDescription: p.longDescription ?? '',
      type: 'clothing',
      isAvailable: p.isAvailable ?? true,
      warrantyMonths: 24,
      officialProductSite: p.officialProductSite,

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

    const gender: 'male' | 'female' | 'unisex' =
      name.includes('women') || name.includes('žensk')
        ? 'female'
        : name.includes('men') || name.includes('mošk')
          ? 'male'
          : 'unisex';

    const size: Clothing['size'] = 'M';

    const material =
      name.includes('merino')
        ? 'Merino volna'
        : name.includes('gore-tex') || name.includes('goretex')
          ? 'Gore-Tex'
          : 'Poliester';

    const color =
      name.includes('black') || name.includes('črn')
        ? 'Črna'
        : name.includes('blue') || name.includes('moder')
          ? 'Modra'
          : '';

    return { size, gender, color, material };
  }

  get filteredAndSortedClothes(): Clothing[] {
    let result = [...this.clothes];

    if (this.filter.size) result = result.filter((c) => c.size === this.filter.size);
    if (this.filter.gender) result = result.filter((c) => c.gender === this.filter.gender);

    if (this.filter.color) {
      const q = this.filter.color.toLowerCase();
      result = result.filter((c) => (c.color ?? '').toLowerCase().includes(q));
    }

    if (this.filter.material) {
      const q = this.filter.material.toLowerCase();
      result = result.filter((c) => (c.material ?? '').toLowerCase().includes(q));
    }

    if (this.filter.availability === 'available') result = result.filter((c) => c.isAvailable);
    else if (this.filter.availability === 'unavailable') result = result.filter((c) => !c.isAvailable);

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

  trackByClothesId = (_: number, item: Clothing) => item.id;

  onImageError(item: Clothing) {
    item.imageUrl = '';
  }

  addToCart(item: Clothing) {
    if (!item.isAvailable) return;
    this.cart.add(item, 1);
  }

  openDetails(item: Clothing) {
    if (!item?.id) return;
    this.selectedCloth = item;
  }

  openDetailsFromCard(item: Clothing, event: Event) {
    const target = event.target as HTMLElement | null;
    if (target && (target.closest('button') || target.closest('a'))) return;
    this.openDetails(item);
  }

  closeDetails() {
    this.selectedCloth = null;
  }
}
