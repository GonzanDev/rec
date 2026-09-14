import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError, shareReplay, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private API_URL = 'https://api.spotify.com/v1';
  private clientId = `eea8b97c4e754c898bc58978c62ac4a1`;
  private clientSecret = `b737690ab26b4fc7b1b41fcdd5512e1a`;

  // Cache del token de client-credentials. Se pide de forma perezosa (recién
  // cuando algo lo necesita) y se vuelve a pedir solo cuando expiró o cuando
  // el pedido anterior falló — antes se pedía una única vez al arrancar la
  // app y, si esa llamada fallaba o pasaba la hora de expiración, todo el
  // resto de la app se quedaba esperando un token que nunca iba a llegar.
  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;
  private tokenRequest$: Observable<string> | null = null;

  constructor(private http: HttpClient) {}

  private fetchToken(): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
    });

    const body = 'grant_type=client_credentials';

    return this.http
      .post<any>('https://accounts.spotify.com/api/token', body, { headers })
      .pipe(
        map((response) => {
          const token = response.access_token;
          if (!token) throw new Error('No access token returned');
          this.cachedToken = token;
          // Restamos un margen de 60s para no usar un token a punto de vencer.
          this.tokenExpiresAt = Date.now() + Math.max((response.expires_in || 3600) - 60, 0) * 1000;
          return token as string;
        })
      );
  }

  private getToken(): Observable<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return of(this.cachedToken);
    }

    // Si ya hay un pedido de token en curso, todos los que llegan mientras
    // tanto se enganchan al mismo en vez de disparar uno por cada uno.
    if (!this.tokenRequest$) {
      this.tokenRequest$ = this.fetchToken().pipe(
        shareReplay(1),
        finalize(() => {
          this.tokenRequest$ = null;
        })
      );
    }
    return this.tokenRequest$;
  }

  search(query: string): Observable<any> {
    return this.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.get<any>(`${this.API_URL}/search`, {
          headers,
          params: {
            q: query,
            type: 'track,album,artist',
            limit: '5',
          },
        });
      })
    );
  }

  /** Discos recién publicados en Spotify. Usado por el widget "Lanzamientos". */
  getNewReleases(): Observable<any[]> {
    return this.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http
          .get<any>(`${this.API_URL}/browse/new-releases`, { headers })
          .pipe(map((data) => data.albums.items));
      })
    );
  }

  /** Discos del año en curso. Usado por el widget "Top 50". */
  getTrendingAlbums(): Observable<any[]> {
    const year = new Date().getFullYear();
    return this.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http
          .get<any>(`${this.API_URL}/search?q=year:${year}&type=album&limit=20`, { headers })
          .pipe(map((data) => data.albums.items));
      })
    );
  }

  /** Discos aclamados del año pasado. Usado por el widget "Destacados". */
  getFeaturedAlbums(): Observable<any[]> {
    const lastYear = new Date().getFullYear() - 1;
    return this.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http
          .get<any>(`${this.API_URL}/search?q=year:${lastYear}&type=album&limit=20`, { headers })
          .pipe(map((data) => data.albums.items));
      })
    );
  }

  getAlbumsByArtist(artistId: string): Observable<any[]> {
    return this.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http
          .get<any>(`${this.API_URL}/artists/${artistId}/albums`, { headers })
          .pipe(
            map((data) => {
              return data.items.filter(
                (album: any) => album.album_type === 'album'
              );
            })
          );
      })
    );
  }

  getAlbumDetails(albumId: string): Observable<any> {
    return this.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.get<any>(`${this.API_URL}/albums/${albumId}`, { headers }).pipe(
          catchError(() => of(null))
        );
      })
    );
  }

  getSongDetails(songId: string): Observable<any> {
    return this.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.get<any>(`${this.API_URL}/tracks/${songId}`, {
          headers,
        });
      })
    );
  }

  getArtistDetails(artistId: string): Observable<any> {
    return this.getToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.get<any>(`${this.API_URL}/artists/${artistId}`, {
          headers,
        });
      })
    );
  }
}
