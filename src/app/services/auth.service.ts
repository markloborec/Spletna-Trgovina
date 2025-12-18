import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, map, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { RegisterRequest, UserProfile } from '../models/user';
import { LoginRequest, LoginResponse } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `${API_BASE_URL}/auth`;
  private readonly TOKEN_KEY = 'auth_token';

  // stanje prijave (brez refresh-a)
  private readonly _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  readonly isLoggedIn$ = this._isLoggedIn$.asObservable();

  constructor(private http: HttpClient) { }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // ---------- token helpers ----------
  private storeToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._isLoggedIn$.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._isLoggedIn$.next(false);
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // podpira camelCase in snake_case (za vsak slučaj)
  private mapUser(u: any, fallback?: Partial<UserProfile>): UserProfile {
    return {
      id: (u.id ?? u._id)?.toString(),
      firstName: u.firstName ?? u.first_name ?? fallback?.firstName ?? '',
      lastName: u.lastName ?? u.last_name ?? fallback?.lastName ?? '',
      email: u.email ?? fallback?.email ?? '',
      deliveryAddress:
        u.deliveryAddress ?? u.delivery_address ?? fallback?.deliveryAddress ?? '',
      phone: u.phone ?? u.phone_number ?? fallback?.phone ?? '',
      // is_admin: u.is_admin ?? (fallback as any)?.is_admin ?? false,
    };
  }

  /**
   * Registracija
   * POST /api/auth/register
   * Backend pričakuje: firstName, lastName, email, deliveryAddress, phone, password
   */
  register(data: RegisterRequest): Observable<UserProfile> {
    if (
      data.confirmPassword !== undefined &&
      data.password !== data.confirmPassword
    ) {
      return of({
        id: undefined,
        firstName: '',
        lastName: '',
        email: '',
        deliveryAddress: '',
        phone: '',
      });
    }

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      deliveryAddress: data.deliveryAddress,
      phone: data.phone,
      password: data.password,
    };

    return this.http
      .post<{ token: string; user: any }>(`${this.authUrl}/register`, payload)
      .pipe(
        tap((res) => this.storeToken(res.token)),
        map((res) => this.mapUser(res.user))
      );
  }

  /**
   * Login
   * POST /api/auth/login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<{ token: string; user: any }>(`${this.authUrl}/login`, credentials)
      .pipe(
        tap((res) => this.storeToken(res.token)),
        map((res) => ({
          token: res.token,
          user: this.mapUser(res.user),
        }))
      );
  }

  /**
   * Trenutni uporabnik (me)
   * GET /api/auth/me
   */
  getProfile(): Observable<UserProfile> {
    return this.http
      .get<any>(`${this.authUrl}/me`, { headers: this.authHeaders() })
      .pipe(map((u) => this.mapUser(u)));
  }

  /**
   * Update profila
   * Backend tega še nima → placeholder
   */
  updateProfile(profile: UserProfile): Observable<UserProfile> {
    return of(profile);
  }

  deleteAccount(): Observable<void> {
    return of(void 0);
  }
}
