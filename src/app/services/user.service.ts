import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { RegisterRequest, UserProfile } from '../models/user';
import { API_BASE_URL } from './api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: UserProfile;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly authUrl = `${API_BASE_URL}/auth`;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) { }

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

  private mapUser(u: any): UserProfile {
    return {
      id: u.id?.toString(),
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      email: u.email ?? '',
      deliveryAddress: u.deliveryAddress ?? '',
      phone: u.phone ?? '',
    };
  }

  register(data: RegisterRequest): Observable<UserProfile> {
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
        map((res) => {
          this.storeToken(res.token);
          return this.mapUser(res.user);
        })
      );
  }

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

getProfile(): Observable<UserProfile> {
  return this.http
    .get<any>(`${this.authUrl}/me`, { headers: this.authHeaders() })
    .pipe(
      map((u) => {
        console.log('ME RAW:', u);
        const mapped = this.mapUser(u);
        console.log('ME MAPPED:', mapped);
        return mapped;
      })
    );
}

  /**
   * Update profila
   * Backend še nima endpointa → placeholder (kasneje zamenjaš s PUT /users/me)
   */
  updateProfile(changes: Partial<UserProfile>): Observable<UserProfile> {
    return this.getProfile().pipe(
      map((current) => ({
        ...current,
        ...changes,
      }))
    );
  }

  deleteAccount(): Observable<void> {
    return of(void 0);
  }
}
