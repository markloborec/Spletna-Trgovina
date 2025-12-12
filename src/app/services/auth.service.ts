import { Injectable } from '@angular/core';
import { RegisterRequest, UserProfile } from '../models/user';
import { UserService, LoginRequest, LoginResponse } from './user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
private readonly authUrl = `${API_BASE_URL}/auth`;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  // ---------- token helpers ----------
  private storeToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private mapUser(u: any, fallback?: Partial<UserProfile>): UserProfile {
    return {
      id: u.id?.toString(),
      firstName: u.first_name ?? fallback?.firstName ?? '',
      lastName: u.last_name ?? fallback?.lastName ?? '',
      email: u.email ?? fallback?.email ?? '',
      // backend tega trenutno ne vrača → ohranimo iz forme ali prazno
      deliveryAddress: fallback?.deliveryAddress ?? '',
      phone: fallback?.phone ?? '',
    };
  }

  /**
   * Registracija
   * POST /api/auth/register
   * Backend pričakuje snake_case: first_name, last_name, email, password
   */
  register(data: RegisterRequest): Observable<UserProfile> {
    // FE validacija (če confirmPassword obstaja)
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      // če imaš UI za errorje, je bolje error sprožit v komponenti,
      // ampak da ne kompliciramo: vrnemo observable error-like rezultat
      return of({
        id: undefined,
        firstName: '',
        lastName: '',
        email: '',
        deliveryAddress: '',
        phone: '',
      });
    }

    const payload: any = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
    };

    // confirmPassword, deliveryAddress, phone backend še ne shranjuje → ne pošiljamo
    return this.http
      .post<{ token: string; user: any }>(`${this.authUrl}/register`, payload)
      .pipe(
        map((res) => {
          this.storeToken(res.token);
          // ohranimo deliveryAddress in phone iz forme (da UI lahko prikaže)
          return this.mapUser(res.user, data);
        })
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
        map((res) => {
          this.storeToken(res.token);
          return {
            token: res.token,
            user: this.mapUser(res.user),
          };
        })
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
   * Backend tega še nima → placeholder (kasneje zamenjaš z PUT /users/me)
   */
  updateProfile(profile: UserProfile): Observable<UserProfile> {
    return of(profile);
  }

  /**
   * Delete account
   * Backend tega še nima → placeholder
   */
  deleteAccount(): Observable<void> {
    return of(void 0);
  }
}
