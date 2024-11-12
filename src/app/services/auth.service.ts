
import { inject, Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, UserCredential } from "@angular/fire/auth";
import { UserService, User } from "./user.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private userService = inject(UserService);

  async signUp(user: User): Promise<UserCredential> {
    try {

      const userCredential = await createUserWithEmailAndPassword(this._auth, user.email, user.password);

      // Guardar el usuario en Firestore
      await this.userService.create({
        id: userCredential.user.uid,  // Asegúrate de asignar el UID generado por Firebase Auth
        email: user.email,
        password: user.password, // Si necesitas almacenar la contraseña en Firestore, aunque no es recomendable.
        username: user.username,
        favoriteAlbums: user.favoriteAlbums || [],
        favoriteArtists:user.favoriteArtists || [],
        reviews: user.reviews || [],
        followers: user.followers || [],
        following: user.following || [],
      });

      return userCredential;
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      throw error;
    }
  }

  signIn(user: User) {
    return signInWithEmailAndPassword(this._auth, user.email, user.password);
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(this._auth, provider);
  }
}


/*import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // Asegúrate de importar PLATFORM_ID



import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private clientId = 'd9741f13bf5944efbf152af6d86969e2';
  private clientSecret = 'c8ba5e05d510407f98896e427945d6ef';
  private redirectUri = 'http://localhost:4200/callback';
  private tokenUrl = 'https://accounts.spotify.com/api/token';
  private localStorageTokenKey = 'spotifyAccessToken';
  private localStorageRefreshTokenKey = 'spotifyRefreshToken';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any // Asegúrate de inyectar PLATFORM_ID
  ) {}

  redirectToSpotifyLogin(): void {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${
      this.clientId
    }&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    window.location.href = authUrl;
  }

  exchangeCodeForToken(code: string): Observable<SpotifyTokenResponse> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', this.redirectUri)
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret);

    return this.http
      .post<SpotifyTokenResponse>(this.tokenUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap((response) => {
          if (isPlatformBrowser(this.platformId)) {
            this.storeToken(
              response.access_token,
              response.refresh_token,
              response.expires_in
            );
          }
        })
      );
  }

  private storeToken(
    token: string,
    refreshToken?: string,
    expiresIn?: number
  ): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.localStorageTokenKey, token);
      if (refreshToken) {
        localStorage.setItem(this.localStorageRefreshTokenKey, refreshToken);
      }
      if (expiresIn) {
        const expirationTime = new Date().getTime() + expiresIn * 1000;
        localStorage.setItem(
          'spotifyTokenExpiration',
          expirationTime.toString()
        );
      }
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.localStorageTokenKey);
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.localStorageTokenKey);
      localStorage.removeItem(this.localStorageRefreshTokenKey);
    }
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.localStorageTokenKey) !== null;
    }
    return false;
  }
}
*/
