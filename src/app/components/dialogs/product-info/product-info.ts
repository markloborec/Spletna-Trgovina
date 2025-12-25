import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-info.html',
  styleUrls: ['./product-info.scss']
})
export class ProductInfo {
  @Input() product: any;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
