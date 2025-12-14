import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { Bicycle, Clothing, Equipment, Product, ProductType, } from '../models/product';
import { ProductFactory } from '../models/product-factory';
import { API_BASE_URL } from './api.config';

export type ConcreteProduct = Bicycle | Clothing | Equipment;

interface ProductsListResponse {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${API_BASE_URL}/products`;

  constructor(private http: HttpClient) { }

  private mapBackendProduct(p: any): ConcreteProduct {
    const base: Product = {
      id: p.id?.toString(),
      name: p.name,
      price: p.price,
      imageUrl: p.image_url || '',
      shortDescription: p.short_description ?? '',
      longDescription: p.long_description ?? '',
      // začasno: backend ne pošilja tipa → damo vse v equipment
      type: 'equipment',
      isAvailable: p.inStock ?? true,
      warrantyMonths: 24,
      officialProductSite: p.brand ? `https://www.google.com/search?q=${encodeURIComponent(`${p.brand} ${p.name}`)}`: undefined,
    };

    return ProductFactory.create(base) as ConcreteProduct;
  }

  getAll(): Observable<ConcreteProduct[]> {
    return this.http.get<ProductsListResponse>(this.apiUrl).pipe(
      map((res) => res.items.map((p) => this.mapBackendProduct(p)))
    );
  }

  getByType(type: ProductType): Observable<ConcreteProduct[]> {
    return this.getAll().pipe(
      map((products) => products.filter((p) => p.type === type))
    );
  }

  getBicycles(): Observable<Bicycle[]> {
    return this.getByType('cycles') as Observable<Bicycle[]>;
  }

  getClothing(): Observable<Clothing[]> {
    return this.getByType('clothing') as Observable<Clothing[]>;
  }

  getEquipment(): Observable<Equipment[]> {
    return this.getByType('equipment') as Observable<Equipment[]>;
  }

  getById(id: string): Observable<ConcreteProduct> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((p) => this.mapBackendProduct(p))
    );
  }

  /**
   * POST - kreiraj nov produkt
   * ❗ Backend trenutno nima POST /api/products.
   */
  create(product: Product): Observable<ConcreteProduct> {
    // TODO: ko dodaš POST /api/products v backend, tole zamenjaj:
    // return this.http.post<any>(this.apiUrl, product).pipe(
    //   map(p => this.mapBackendProduct(p))
    // );
    return of(ProductFactory.create(product) as ConcreteProduct);
  }

  /**
   * PATCH/PUT - posodobi obstoječ produkt
   * ❗ Backend še nima update endpointa – placeholder.
   */
  update(id: string, changes: Partial<Product>): Observable<ConcreteProduct> {
    // TODO: ko dodaš PUT /api/products/:id:
    // return this.http.put<any>(`${this.apiUrl}/${id}`, changes).pipe(
    //   map(p => this.mapBackendProduct(p))
    // );
    return of(
      ProductFactory.create({ ...(changes as Product), id }) as ConcreteProduct
    );
  }

  /**
   * DELETE - odstrani produkt
   * ❗ Backend še nima DELETE /api/products/:id – placeholder.
   */
  delete(id: string): Observable<void> {
    // TODO: ko dodaš DELETE /api/products/:id:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
    return of(void 0);
  }
}
