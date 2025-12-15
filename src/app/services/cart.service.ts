import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';

export type CartItem = {
  product: Product;
  qty: number;
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'cart_v1';

  private readonly itemsSubject = new BehaviorSubject<CartItem[]>(this.load());
  readonly items$ = this.itemsSubject.asObservable();

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  add(product: Product, qty = 1): void {
    const items = [...this.items];
    const idx = items.findIndex((i) => i.product.id === product.id);

    if (idx >= 0) items[idx] = { product: items[idx].product, qty: items[idx].qty + qty };
    else items.push({ product, qty });

    this.set(items);
  }

  remove(productId: string): void {
    this.set(this.items.filter((i) => i.product.id !== productId));
  }

  setQty(productId: string, qty: number): void {
    const q = Math.max(1, Math.floor(Number(qty) || 1));
    this.set(this.items.map((i) => (i.product.id === productId ? { ...i, qty: q } : i)));
  }

  clear(): void {
    this.set([]);
  }

  get totalItems(): number {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  }

  get totalPrice(): number {
    return this.items.reduce((sum, i) => sum + i.qty * (Number(i.product.price) || 0), 0);
  }

  private set(items: CartItem[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
