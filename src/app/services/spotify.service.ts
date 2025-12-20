import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, catchError, filter, take, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private API_URL = 'https://api.spotify.com/v1';
  private clientId = `eea8b97c4e754c898bc58978c62ac4a1`;
  private clientSecret = `b737690ab26b4fc7b1b41fcdd5512e1a`;

  private tokenSubject = new BehaviorSubject<string | null>(null);
  private token$ = this.tokenSubject.asObservable().pipe(
    filter((token): token is string => !!token),
    take(1) // Always take 1 and complete
  );

  constructor(private http: HttpClient) {
    this.fetchToken().subscribe();
  }

  private fetchToken(): Observable<string> {
    if (this.tokenSubject.value) {
      return of(this.tokenSubject.value);
    }

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
          if (token) {
            this.tokenSubject.next(token);
            return token;
          } else {
            throw new Error('No access token returned');
          }
        })
      );
  }

  private getToken(): Observable<string> {
    if (this.tokenSubject.value) {
      return of(this.tokenSubject.value);
    }
    return this.tokenSubject.asObservable().pipe(
      filter((token): token is string => !!token),
      take(1)
    );
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

  getTopAlbums(): Observable<any[]> {
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
          catchError((error) => {
            console.error('Error al obtener detalles del álbum:', error);
            return of(null);
          })
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
