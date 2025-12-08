// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { Bicycle, Clothing, Equipment, Product, ProductType, } from '../models/product';
import { ProductFactory } from '../models/product-factory';
import { HttpClient } from '@angular/common/http';

export type ConcreteProduct = Bicycle | Clothing | Equipment;

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = '/api/products';

  constructor(private http: HttpClient) {}
  /**
   * Vrne vse produkte (frontend filtriranje/sort na komponentah).
   */
  getAll(): Observable<ConcreteProduct[]> {
    // Ko bo backend povezan, samo odkomentiraš ↓
    // return this.http.get<Product[]>(this.apiUrl).pipe(
    //   map(products => products.map(p => ProductFactory.create(p)))
    // );
    return of([]); // začasno
  }

  /**
   * Vrne produkte po tipu ('cycles', 'equipment', 'clothing')
   */
  getByType(type: ProductType): Observable<ConcreteProduct[]> {
    // return this.http.get<Product[]>(`${this.apiUrl}?type=${type}`).pipe(
    //   map(products => products.map(p => ProductFactory.create(p)))
    // );
    return of([]);
  }

  // ---------- KONKRETNI TYPED GETTERJI -----------------

  getBicycles(): Observable<Bicycle[]> {
    // return this.getByType('cycles') as Observable<Bicycle[]>;
    return of([] as Bicycle[]);
  }

  getClothing(): Observable<Clothing[]> {
    // return this.getByType('clothing') as Observable<Clothing[]>;
    return of([] as Clothing[]);
  }

  getEquipment(): Observable<Equipment[]> {
    // return this.getByType('equipment') as Observable<Equipment[]>;
    return of([] as Equipment[]);
  }

  /**
   * Vrne 1 produkt po ID-ju.
   */
  getById(id: string): Observable<ConcreteProduct | undefined> {
    // return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
    //   map(product => ProductFactory.create(product))
    // );
    return of(undefined);
  }

  /**
   * POST - kreiraj nov produkt
   */
  create(product: Product): Observable<ConcreteProduct> {
    // return this.http.post<Product>(this.apiUrl, product).pipe(
    //   map(p => ProductFactory.create(p))
    // );
    return of(ProductFactory.create(product));
  }

  /**
   * PATCH/PUT - posodobi obstoječ produkt
   */
  update(id: string, changes: Partial<Product>): Observable<ConcreteProduct> {
    // return this.http.put<Product>(`${this.apiUrl}/${id}`, changes).pipe(
    //   map(p => ProductFactory.create(p))
    // );
    return of(ProductFactory.create({ ...(changes as Product), id }));
  }

  /**
   * DELETE - odstrani produkt
   */
  delete(id: string): Observable<void> {
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
    return of(void 0);
  }
}
