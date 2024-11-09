import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string; // Opcional
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private clientId = 'd9741f13bf5944efbf152af6d86969e2';
  private clientSecret = 'T411b1e81cb13491d848d20d60a2bf9a4';
  private redirectUri = 'http://localhost:4200/';
  private tokenUrl = 'https://accounts.spotify.com/api/token';
  private scopes = 'user-read-private user-read-email';


  constructor(private http: HttpClient) {}

  redirectToSpotifyLogin(): void {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${this.clientId}&scope=${encodeURIComponent(this.scopes)}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    window.location.href = authUrl;
  }

  exchangeCodeForToken(code: string): Observable<SpotifyTokenResponse> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', this.redirectUri)
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret);

    return this.http.post<SpotifyTokenResponse>(this.tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }
}