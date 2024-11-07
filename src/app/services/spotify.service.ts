import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private readonly API_URL = 'https://api.spotify.com/v1';
  private readonly TOKEN =
    'BQCkZMYggfI4Vv36W1WkIIKfrvkcDM7g-IgEzH8NhoJYdA8ckGo-g_V4cq-PAD_snELzZafb0x3NK3n6WCPV4Fp051SNJO1eCYrjtoDdSl-iFkrDfxc';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.TOKEN}`,
    });
    return this.http.get<any>(`${this.API_URL}/search`, {
      headers,
      params: {
        q: query,
        type: ['track'],
      },
    });
  }
}
