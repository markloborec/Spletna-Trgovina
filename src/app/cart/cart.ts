import { Component } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [ CommonModule, CurrencyPipe ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {constructor(public cart: CartService) {}

  remove(id: string) {
    this.cart.remove(id);
  }

  setQty(id: string, value: any) {
    this.cart.setQty(id, Number(value));
  }

  clear() {
    this.cart.clear();
  }
}
