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
};

export type GetAllParams = {
  type?: ProductType;
  page?: number;
  pageSize?: number;
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${API_BASE_URL}/products`;

  constructor(private http: HttpClient) {}

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

  create(product: Product): Observable<ConcreteProduct> {
    return of(product as ConcreteProduct);
  }

  update(id: string, changes: Partial<Product>): Observable<ConcreteProduct> {
    return of({ ...(changes as Product), id } as ConcreteProduct);
  }

  delete(_id: string): Observable<void> {
    return of(void 0);
  }

  private mapBackendProduct(p: BackendProductDto, fallbackType?: ProductType): ConcreteProduct {
    const type: ProductType = (p.type as ProductType) ?? fallbackType ?? 'equipment';

    const base: Product = {
      id: (p.id ?? p._id ?? '').toString(),
      name: p.name,
      price: Number(p.price ?? 0),
      imageUrl: p.imageUrl ?? p.image_url ?? '',
      shortDescription: p.shortDescription ?? p.short_description ?? '',
      longDescription: p.longDescription ?? p.long_description ?? '',
      type,
      isAvailable: (p.isAvailable ?? p.inStock) ?? true,
      warrantyMonths: Number(p.warrantyMonths ?? 24),
      officialProductSite: p.officialProductSite,
    };

    if (type === 'cycles') {
      const derived = this.deriveBikeSpecs(base.name, base.price);
      return { ...base, ...derived } as Bicycle;
    }

    if (type === 'clothing') {
      return {
        ...base,
        size: p.size ?? 'M',
        gender: p.gender,
        material: p.material,
        color: p.color,
      } as Clothing;
    }

    return {
      ...base,
      compatibility: this.normalizeCompatibility(p.compatibility),
      weight: p.weight,
      material: p.material,
      brand: p.brand,
    } as Equipment;
  }

  private normalizeCompatibility(value: BackendProductDto['compatibility']): string[] {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  private deriveBikeSpecs(nameRaw: string, priceRaw: number): { wheelSize: number; frameMaterial: string; gearCount: number } {
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
