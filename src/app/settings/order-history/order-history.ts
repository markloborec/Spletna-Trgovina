import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { API_BASE_URL } from '../../services/api.config';
import { AuthService } from '../../services/auth.service';

type OrderListItem = {
  orderId: string;
  status: string;
  date: string;
  total: number;
  items: { name: string; qty: number }[];
};

@Component({
  selector: 'app-order-history',
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss',
})
export class OrderHistory implements OnInit, OnDestroy {
  private sub?: Subscription;

  isLoggedIn = false;
  loading = false;
  error = '';

  orders: OrderListItem[] = [];
  private readonly url = `${API_BASE_URL}/orders/my`;

  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void {
    this.sub = this.auth.isLoggedIn$.subscribe(v => {
      this.isLoggedIn = v;
      if (v) this.load();
      else this.orders = [];
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  load(): void {
    this.error = '';
    this.loading = true;

    const token = this.auth.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ orders: OrderListItem[] }>(this.url, { headers }).subscribe({
      next: (res) => {
        this.orders = res.orders ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Napaka pri nalaganju naročil.';
      }
    });
  }
}
