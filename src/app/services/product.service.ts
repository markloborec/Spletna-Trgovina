import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';

import { API_BASE_URL } from './api.config';
import { Bicycle, Clothing, Equipment, Product, ProductType } from '../models/product';

export type ConcreteProduct = Bicycle | Clothing | Equipment;

export interface ProductsListResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type BackendProductDto = {
  id?: string | number;
  _id?: string;

  type?: ProductType;
  name: string;
  price: number;

  // camelCase
  imageUrl?: string;
  shortDescription?: string;
  longDescription?: string;
  isAvailable?: boolean;
  warrantyMonths?: number;
  officialProductSite?: string;

  // snake_case fallback
  image_url?: string;
  short_description?: string;
  long_description?: string;
  inStock?: boolean;

  // optional extra fields
  brand?: string;
  material?: string;
  weight?: number;
  compatibility?: string[] | string;

  // clothing
  size?: Clothing['size'];
  gender?: 'male' | 'female' | 'unisex';
  color?: string;
  ratingAvg?: number;
  ratingCount?: number;
};

export type GetAllParams = {
  type?: ProductType;
  page?: number;
  pageSize?: number;
};

export type ProductReviewDto = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ProductReviewsResponse = {
  items: ProductReviewDto[];
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${API_BASE_URL}/products`;

  constructor(private http: HttpClient) { }

  getAll(params: GetAllParams = {}): Observable<ConcreteProduct[]> {
    let httpParams = new HttpParams();

    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.pageSize) httpParams = httpParams.set('pageSize', String(params.pageSize));

    return this.http.get<ProductsListResponse<BackendProductDto>>(this.apiUrl, { params: httpParams }).pipe(
      map((res) => (res.items ?? []).map((p) => this.mapBackendProduct(p, params.type)))
    );
  }

  getBicycles(pageSize = 100): Observable<Bicycle[]> {
    return this.getAll({ type: 'cycles', pageSize }) as Observable<Bicycle[]>;
  }

  getClothing(pageSize = 100): Observable<Clothing[]> {
    return this.getAll({ type: 'clothing', pageSize }) as Observable<Clothing[]>;
  }

  getEquipment(pageSize = 100): Observable<Equipment[]> {
    return this.getAll({ type: 'equipment', pageSize }) as Observable<Equipment[]>;
  }

  getById(id: string): Observable<ConcreteProduct> {
    return this.http.get<BackendProductDto>(`${this.apiUrl}/${id}`).pipe(
      map((p) => this.mapBackendProduct(p))
    );
  }

  getProductReviews(productId: string): Observable<ProductReviewDto[]> {
    return this.http.get<ProductReviewsResponse>(`${this.apiUrl}/${productId}/reviews`).pipe(
      map((res) => res?.items ?? [])
    );
  }

  create(product: Product): Observable<ConcreteProduct> {
    return of(product as ConcreteProduct);
  }

  private mapBackendProduct(p: BackendProductDto, forcedType?: ProductType): ConcreteProduct {
    const id = String(p.id ?? p._id ?? '');
    const type: ProductType = forcedType ?? (p.type as ProductType) ?? 'cycles';

    const imageUrl = (p.imageUrl ?? p.image_url ?? '') as string;
    const shortDescription = (p.shortDescription ?? p.short_description ?? '') as string;
    const longDescription = (p.longDescription ?? p.long_description ?? '') as string;

    const isAvailable = typeof p.isAvailable === 'boolean' ? p.isAvailable: typeof p.inStock === 'boolean'
        ? p.inStock: true;

    const base: any = {
      id,
      type,
      name: p.name,
      price: Number(p.price ?? 0),
      imageUrl,
      shortDescription,
      longDescription,
      isAvailable,
      warrantyMonths: typeof p.warrantyMonths === 'number' ? p.warrantyMonths : 24,
      officialProductSite: p.officialProductSite,

      ratingAvg: typeof p.ratingAvg === 'number' ? p.ratingAvg : undefined,
      ratingCount: typeof p.ratingCount === 'number' ? p.ratingCount : undefined,
    };

    if (type === 'clothing') {
      const clothing: Clothing = {
        ...base,
        size: (p.size ?? 'M') as Clothing['size'],
        gender: p.gender,
        material: p.material,
        color: p.color,
      };
      return clothing;
    }

    if (type === 'equipment') {
      const compatibility = Array.isArray(p.compatibility)
        ? p.compatibility: typeof p.compatibility === 'string'
          ? p.compatibility.split(',').map((x) => x.trim()).filter(Boolean): [];

      const equipment: Equipment = {
        ...base,
        compatibility,
        weight: typeof p.weight === 'number' ? p.weight : undefined,
        material: p.material,
        brand: p.brand,
      };
      return equipment;
    }

    const derived = this.deriveBikeSpecs(p.name, p.price);

    const bicycle: Bicycle = {
      ...base,
      wheelSize: derived.wheelSize,
      frameMaterial: derived.frameMaterial,
      gearCount: derived.gearCount,
    };

    return bicycle;
  }

  private deriveBikeSpecs(nameRaw: any, priceRaw: any): {
    wheelSize: 26 | 27.5 | 28 | 29;
    frameMaterial: string;
    gearCount: number;
  } {
    const name = (nameRaw || '').toLowerCase();
    const price = Number(priceRaw || 0);

    if (name.includes('tarmac') || name.includes('roubaix') || name.includes('cest')) {
      return { wheelSize: 28, frameMaterial: price >= 6000 ? 'Carbon' : 'Aluminij', gearCount: price >= 3000 ? 22 : 18 };
    }

    if (name.includes('marlin') || name.includes('mtb') || name.includes('gors') || name.includes('trail')) {
      return { wheelSize: 29, frameMaterial: 'Aluminij', gearCount: 12 };
    }

    return { wheelSize: 28, frameMaterial: 'Aluminij', gearCount: 11 };
  }
}
