import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipment } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { ProductInfo } from '../../dialogs/product-info/product-info';

@Component({
  selector: 'app-equipments',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule, ProductInfo],
  templateUrl: './equipments.html',
  styleUrls: ['./equipments.scss'], // FIX: styleUrl -> styleUrls
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

  sortBy: 'name' | 'price' | 'weight' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedEquipment: Equipment | null = null;

  ngOnInit(): void {
    this.productService.getEquipment(100).subscribe({
      next: (items) => {
        this.equipments = (items ?? []).map((it: any) => {
          const id = String(it?.id ?? it?._id ?? '');
          if (!id) console.warn('Equipment item WITHOUT id/_id from backend:', it);
          return { ...it, id } as Equipment;
        });
      },
      error: (err) => {
        console.error('PRODUCTS ERROR:', err);
        this.equipments = [];
      },
    });
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  /** Tipkovnična podpora za kartico: Enter / Space odpre podrobnosti */
  onCardKeydown(event: KeyboardEvent, item: Equipment) {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.openDetails(item);
    }
  }

  /** Bolj opisni ALT (WAVE opozori, če je alt generičen ali manjka) */
  getEquipmentImageAlt(item: Equipment): string {
    const name = (item?.name || '').trim();
    if (!name) return 'Fotografija opreme';
    const availability = item.isAvailable ? 'na zalogi' : 'ni na zalogi';
    return `Fotografija opreme: ${name} (${availability})`;
  }

  openDetails(item: Equipment) {
    if (!item?.id) {
      console.warn('openDetails called with equipment without id:', item);
      return;
    }
    this.selectedEquipment = item;
  }

  openDetailsFromCard(item: Equipment, event: Event) {
    const target = event.target as HTMLElement | null;
    if (target && (target.closest('button') || target.closest('a'))) return;
    this.openDetails(item);
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
      const q = this.filter.compatibility.trim();
      if (q) {
        const qLower = q.toLowerCase();
        result = result.filter((e) => (e.compatibility ?? []).some((c) => (c ?? '').toLowerCase().includes(qLower)));
      }
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
