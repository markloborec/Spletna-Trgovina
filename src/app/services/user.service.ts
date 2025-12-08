import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest, UserProfile } from '../models/user';

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
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = '/api/users';    // kasneje uporabiš pravi URL

  constructor(private http: HttpClient) { }

  /**
   * Registracija novega uporabnika.
   */
  register(data: RegisterRequest): Observable<UserProfile> {
    // return this.http.post<UserProfile>(`${this.apiUrl}/register`, data);
    return of({ ...data }); // placeholder
  }

  /**
   * Prijava uporabnika.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
    return of({
      token: 'fake_token',
      user: {
        id: 'TEMP-ID',
        firstName: 'John',
        lastName: 'Doe',
        email: credentials.email,
        phone: '',
        deliveryAddress: ''
      }
    });
  }

  /**
   * Odjava
   */
  logout(): void {
    // npr. this.http.post(`${this.apiUrl}/logout`, {})
    // ali front-end clear
    localStorage.removeItem('token');
  }

  /**
   * Pridobi podatke trenutnega uporabnika.
   */
  getProfile(): Observable<UserProfile> {
    // return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
    return of({
      id: 'TEMP-ID',
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      deliveryAddress: '',
      phone: ''
    });
  }

  /**
   * Posodobi podatke profila.
   */
  updateProfile(changes: Partial<UserProfile>): Observable<UserProfile> {
    // return this.http.put<UserProfile>(`${this.apiUrl}/profile`, changes);
    return of({
      id: 'TEMP-ID',
      firstName: changes.firstName ?? 'Demo',
      lastName: changes.lastName ?? 'User',
      email: changes.email ?? 'demo@example.com',
      deliveryAddress: changes.deliveryAddress ?? '',
      phone: changes.phone ?? ''
    });
  }

  /**
   * Izbriše uporabnika.
   */
  deleteAccount(): Observable<void> {
    // return this.http.delete<void>(`${this.apiUrl}/profile`);
    return of(void 0);
  }
}
