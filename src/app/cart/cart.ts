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

type Address = {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
};

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit, OnDestroy {
  readonly VAT_RATE = 0.22;
  readonly SHIPPING_FLAT = 2.99;

  isLoggedIn = false;
  private sub?: Subscription;

  payment: PaymentMethod = 'card';
  delivery: DeliveryMethod = 'courier';

  // uporablja se samo za guest checkout
  address: Address = {
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

  private validateGuestAddressIfNeeded(): boolean {
    // naslov je obvezen samo za guest + courier
    if (this.delivery !== 'courier') return true;
    if (this.isLoggedIn) return true;

    const a = this.address;
    if (!a.fullName || !a.street || !a.city || !a.postalCode || !a.phone) {
      this.errorMessage = 'Prosim izpolni vse obvezne podatke za dostavo.';
      return false;
    }
    return true;
  }

  private getProductId(it: any): string {
    // ✅ podpira _id ali id (odvisno kako dobiš iz API)
    const p: any = it?.product ?? {};
    return (p._id ?? p.id ?? '').toString();
  }

  placeOrder() {
    this.resetMessages();

    if (this.cart.items.length === 0) {
      this.errorMessage = 'Košarica je prazna.';
      return;
    }

    // če UI kaže da si prijavljen, token mora obstajati, sicer backend te vidi kot guest
    const token = this.auth.getToken();
    if (this.isLoggedIn && !token) {
      this.errorMessage = 'Seja ni veljavna (manjka token). Prosim odjavi/prijavi se znova.';
      return;
    }

    if (!this.validateGuestAddressIfNeeded()) {
      return;
    }

    const itemsPayload = this.cart.items.map(it => ({
      productId: this.getProductId(it),
      qty: it.qty,
    }));

    // extra safety: če je kak productId prazen, pokaži razumljiv error
    if (itemsPayload.some(x => !x.productId)) {
      this.errorMessage = 'Napaka v košarici (izdelek nima ID). Osveži stran in dodaj izdelek znova.';
      return;
    }

    const payload: any = {
      items: itemsPayload,
      payment: this.payment,
      delivery: this.delivery,

      // ✅ shippingAddress pošlje samo guest + courier
      shippingAddress:
        !this.isLoggedIn && this.delivery === 'courier'
          ? {
            fullName: this.address.fullName,
            street: this.address.street,
            city: this.address.city,
            postalCode: this.address.postalCode,
            phone: this.address.phone,
          }
          : null,
    };

    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};

    this.isPlacingOrder = true;

    this.http
      .post<{ orderId: string }>(this.ordersUrl, payload, options)
      .pipe(finalize(() => (this.isPlacingOrder = false)))
      .subscribe({
        next: (res) => {
          const id = res?.orderId ?? '';
          this.successMessage = `Naročilo oddano. Št. naročila: ${id}`;
          this.cart.clear();

          // počisti guest naslov samo, če je bil guest
          if (!this.isLoggedIn) {
            this.address = { fullName: '', street: '', city: '', postalCode: '', phone: '' };
          }
        },
        error: (err) => {
          const code = err?.error?.error;

          if (code === 'ITEMS_REQUIRED') {
            this.errorMessage = 'Košarica je prazna.';
          } else if (code === 'SHIPPING_ADDRESS_REQUIRED') {
            this.errorMessage = 'Naslov za dostavo je obvezen.';
          } else if (code === 'PROFILE_ADDRESS_MISSING') {
            this.errorMessage = 'V profilu nimaš nastavljenega naslova za dostavo.';
          } else if (code === 'PAYMENT_AND_DELIVERY_REQUIRED') {
            this.errorMessage = 'Manjka način plačila ali dostave.';
          } else if (code === 'INVALID_PRODUCT_ID') {
            this.errorMessage = 'Neveljaven izdelek v košarici (ID).';
          } else if (code === 'PRODUCT_NOT_FOUND') {
            this.errorMessage = 'Nekateri izdelki niso več na voljo. Osveži stran in dodaj znova.';
          } else if (code === 'INVALID_QTY') {
            this.errorMessage = 'Neveljavna količina izdelka.';
          } else if (code === 'AUTH_INVALID_TOKEN' || code === 'AUTH_MISSING_TOKEN') {
            this.errorMessage = 'Seja je potekla. Prosim prijavi se znova.';
          } else {
            this.errorMessage = 'Napaka pri oddaji naročila.';
          }
        },
      });
  }
}
