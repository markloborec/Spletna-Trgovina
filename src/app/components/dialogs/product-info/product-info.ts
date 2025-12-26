import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, AfterViewInit, OnDestroy, ElementRef, ViewChild, } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, } from '@angular/common';
import { ProductService, ProductReviewDto } from '../../../services/product.service';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, DecimalPipe, NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault,],
  templateUrl: './product-info.html',
  styleUrls: ['./product-info.scss'],
})
export class ProductInfo implements OnChanges, AfterViewInit, OnDestroy {
  @Input() product: any;
  @Output() close = new EventEmitter<void>();

  @ViewChild('dialogTitle', { static: false }) dialogTitle?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn', { static: false }) closeBtn?: ElementRef<HTMLButtonElement>;

  titleId = 'product-dialog-title';
  descId = 'product-dialog-desc';

  // "svež" produkt iz backenda (zaradi ratingAvg/ratingCount ipd.)
  productFull: any = null;

  reviews: ProductReviewDto[] = [];
  loadingProduct = false;
  loadingReviews = false;
  reviewsError = '';

  private prevBodyOverflow = '';

  constructor(private productService: ProductService) { }

  ngAfterViewInit(): void {
    this.lockScroll();
    setTimeout(() => {
      (this.dialogTitle?.nativeElement ?? this.closeBtn?.nativeElement)?.focus();
    }, 0);
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['product']) return;

    const id = this.product?.id;
    if (id) {
      this.loadProductAndReviews(String(id));
    } else {
      this.productFull = this.product;
      this.reviews = [];
    }
  }

  closeModal() {
    this.close.emit();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const modal = document.querySelector('.modal') as HTMLElement | null;
    if (!modal) return;

    const focusables = Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true');

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    }
  }

  private lockScroll() {
    this.prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll() {
    document.body.style.overflow = this.prevBodyOverflow || '';
  }

  private loadProductAndReviews(id: string) {
    this.productFull = this.product; // fallback, dokler ne pride svež response

    this.loadingProduct = true;
    this.productService.getById(id).subscribe({
      next: (p) => {
        this.productFull = p;
        this.loadingProduct = false;
      },
      error: () => {
        this.loadingProduct = false;
      },
    });

    this.loadingReviews = true;
    this.reviewsError = '';
    this.productService.getProductReviews(id).subscribe({
      next: (items) => {
        this.reviews = items ?? [];
        this.loadingReviews = false;
      },
      error: () => {
        this.reviewsError = 'Mnenj ni bilo mogoče naložiti.';
        this.loadingReviews = false;
      },
    });
  }

  get avgRating(): number {
    const p = this.productFull ?? this.product;
    const avg = p?.ratingAvg;
    if (typeof avg === 'number') return avg;

    if (!this.reviews?.length) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return sum / this.reviews.length;
  }

  get ratingCount(): number {
    const p = this.productFull ?? this.product;
    const cnt = p?.ratingCount;
    if (typeof cnt === 'number') return cnt;
    return this.reviews?.length ?? 0;
  }
}
