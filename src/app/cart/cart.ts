import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, finalize } from 'rxjs';

import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../services/api.config';

type PaymentMethod = 'card' | 'cod' | 'bank';
type DeliveryMethod = 'courier' | 'pickup';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit, OnDestroy {
  readonly VAT_RATE = 0.22;

  // ✅ fiksni strošek dostave
  readonly SHIPPING_FLAT = 2.99;

  isLoggedIn = false;
  private sub?: Subscription;

  payment: PaymentMethod = 'card';
  delivery: DeliveryMethod = 'courier';

  guestAddress = {
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    phone: '',
  };

  isPlacingOrder = false;
  errorMessage = '';
  successMessage = '';

  private readonly ordersUrl = `${API_BASE_URL}/orders`;

  constructor(
    public cart: CartService,
    private auth: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.sub = this.auth.isLoggedIn$.subscribe(v => (this.isLoggedIn = v));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get itemsTotal(): number {
    return this.cart.totalPrice;
  }

  get taxAmount(): number {
    return this.itemsTotal * this.VAT_RATE;
  }

  // ✅ 2.99€ vedno za courier, 0€ za pickup
  get shippingCost(): number {
    return this.delivery === 'pickup' ? 0 : this.SHIPPING_FLAT;
  }

  get grandTotal(): number {
    return this.itemsTotal + this.taxAmount + this.shippingCost;
  }

  remove(id: string) {
    this.cart.remove(id);
  }

  setQty(id: string, value: any) {
    this.cart.setQty(id, Number(value));
  }

  clear() {
    this.cart.clear();
    this.resetMessages();
  }

  private resetMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  placeOrder() {
    this.resetMessages();

    if (!this.isLoggedIn) {
      this.errorMessage = 'Za oddajo naročila se moraš prijaviti (registriran uporabnik).';
      return;
    }

    if (this.cart.items.length === 0) {
      this.errorMessage = 'Košarica je prazna.';
      return;
    }

    const payload = {
      items: this.cart.items.map(it => ({
        productId: it.product.id,
        name: it.product.name,
        qty: it.qty,
        unitPrice: it.product.price,
        lineTotal: it.qty * it.product.price,
      })),
      payment: this.payment,
      delivery: this.delivery,
      totals: {
        itemsTotal: this.itemsTotal,
        tax: this.taxAmount,
        shipping: this.shippingCost,
        grandTotal: this.grandTotal,
      },
      guestAddress: null,
    };

    const token = this.auth.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.isPlacingOrder = true;

    this.http
      .post<{ orderId: string }>(this.ordersUrl, payload, { headers })
      .pipe(finalize(() => (this.isPlacingOrder = false)))
      .subscribe({
        next: (res) => {
          this.successMessage = `Naročilo oddano. Št. naročila: ${res.orderId}`;
          this.cart.clear();
        },
        error: (err) => {
          const code = err?.error?.error;
          if (code === 'AUTH_MISSING_TOKEN' || code === 'AUTH_INVALID_TOKEN') {
            this.errorMessage = 'Seja je potekla. Prosim prijavi se znova.';
          } else if (code === 'ORDER_EMPTY') {
            this.errorMessage = 'Košarica je prazna.';
          } else {
            this.errorMessage = 'Napaka pri oddaji naročila.';
          }
        },
      });
  }
}
