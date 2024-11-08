import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private clientId = ''; // Reemplaza con tu Client ID de Spotify
  private redirectUri = 'http://localhost:4200/callback'; // URI de redirección configurada
  private scopes = 'user-read-private user-read-email'; // Define los permisos que necesitas
  private responseType = 'code';

  constructor() {}

  getSpotifyAuthUrl(): string {
    const authorizationUrl = `https://accounts.spotify.com/authorize?response_type=${this.responseType}&client_id=${this.clientId}&scope=${encodeURIComponent(this.scopes)}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    return authorizationUrl;
  }

  redirectToSpotifyLogin(): void {
    window.location.href = this.getSpotifyAuthUrl();
  }
}

