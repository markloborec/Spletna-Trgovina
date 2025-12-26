import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { API_BASE_URL } from '../../../../services/api.config';
import { AuthService } from '../../../../services/auth.service';

type OrderListItem = {
  orderId: string;
  status: string;
  date: string;
  total: number;
  items: { productId: string; name: string; qty: number; reviewed: boolean }[];
};

type ReviewUIState = {
  rating: number;
  hoverRating: number;
  comment: string;
  submitting: boolean;
  error: string;
  success: string;
};

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, FormsModule],
  templateUrl: './order-history.html',
  styleUrls: ['./order-history.scss'],
})
export class OrderHistory implements OnInit, OnDestroy {
  private sub?: Subscription;

  isLoggedIn = false;
  loading = false;
  error = '';

  orders: OrderListItem[] = [];
  private readonly url = `${API_BASE_URL}/orders/my`;

  reviewState: Record<string, ReviewUIState> = {};
  readonly stars = [1, 2, 3, 4, 5];

  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void {
    this.sub = this.auth.isLoggedIn$.subscribe((v) => {
      this.isLoggedIn = v;
      if (v) this.load();
      else this.orders = [];
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private makeDefaultState(): ReviewUIState {
    return { rating: 0, hoverRating: 0, comment: '', submitting: false, error: '', success: '' };
  }

  private pid(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if ((value as any)._id) return this.pid((value as any)._id);
      if ((value as any).id) return this.pid((value as any).id);
      if (typeof (value as any).toString === 'function') return (value as any).toString();
    }
    return String(value);
  }

  private productIdFromItem(it: any): string {
    const pid =
      this.pid(it?.productId) ||
      this.pid(it?.product_id) ||
      this.pid(it?.product?._id) ||
      this.pid(it?.product?.id) ||
      this.pid(it?.productId?._id);

    return pid;
  }

  key(orderId: string, productId: string, itemIndex: number): string {
    return `${orderId}__${productId}__${itemIndex}`;
  }

  state(orderId: string, productId: string, itemIndex: number): ReviewUIState {
    const k = this.key(orderId, productId, itemIndex);
    if (!this.reviewState[k]) this.reviewState[k] = this.makeDefaultState();
    return this.reviewState[k];
  }

  setHover(orderId: string, productId: string, itemIndex: number, rating: number) {
    const s = this.state(orderId, productId, itemIndex);
    s.hoverRating = rating;
  }

  load(): void {
    this.error = '';
    this.loading = true;

    const token = this.auth.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(this.url, { headers }).subscribe({
      next: (res) => {
        const rawOrders: any[] = Array.isArray(res) ? res : (res?.orders ?? []);

        this.orders = rawOrders.map((o: any) => {
          const rawItems = o?.items ?? [];

          return {
            orderId: String(o?._id ?? o?.orderId ?? ''),
            status: String(o?.status ?? ''),
            date: o?.createdAt ?? o?.date ?? '',
            total: Number(o?.totals?.grandTotal ?? o?.total ?? 0),
            items: rawItems.map((it: any) => {
              const productId = this.productIdFromItem(it);

              if (!productId) {
                console.warn('Order item WITHOUT productId:', {
                  orderId: String(o?._id ?? o?.orderId ?? ''),
                  item: it,
                });
              }

              return {
                productId,
                name: String(it?.name ?? ''),
                qty: Number(it?.qty ?? 0),
                reviewed: Boolean(it?.reviewed ?? false),
              };
            }),
          };
        });

        for (const o of this.orders) {
          o.items.forEach((it, idx) => {
            if (it.productId) this.state(o.orderId, it.productId, idx);
          });
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Napaka pri nalaganju naročil.';
      },
    });
  }

  setRating(orderId: string, productId: string, itemIndex: number, rating: number): void {
    const s = this.state(orderId, productId, itemIndex);
    s.rating = rating;
    s.error = '';
    s.success = '';
  }

  submitReview(orderId: string, productId: string, itemIndex: number): void {
    const s = this.state(orderId, productId, itemIndex);
    if (s.submitting) return;

    s.error = '';
    s.success = '';

    if (!productId) {
      s.error = 'Ta postavka v naročilu nima productId (legacy naročilo).';
      return;
    }

    if (!s.rating || s.rating < 1 || s.rating > 5) {
      s.error = 'Izberi oceno (1–5 zvezdic).';
      return;
    }

    const token = this.auth.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `${API_BASE_URL}/products/${productId}/reviews`;

    s.submitting = true;

    this.http.post(url, { rating: s.rating, comment: s.comment }, { headers }).subscribe({
      next: () => {
        s.submitting = false;
        s.success = 'Hvala! Mnenje je bilo oddano.';

        const order = this.orders.find((o) => o.orderId === orderId);
        if (order?.items[itemIndex]) order.items[itemIndex].reviewed = true;
      },
      error: (err) => {
        s.submitting = false;
        const code = err?.error?.error;
        if (code === 'REVIEW_ALREADY_EXISTS') s.error = 'Za ta izdelek si že oddal/a mnenje.';
        else if (code === 'REVIEW_NOT_PURCHASED') s.error = 'Mnenje lahko oddaš samo za kupljen izdelek.';
        else s.error = 'Oddaja mnenja ni uspela. Poskusi znova.';
      },
    });
  }
}
