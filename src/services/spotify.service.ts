import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private readonly API_URL = 'https://api.spotify.com/v1';
  private readonly TOKEN =
    'BQCxbmo3P-WDkGrat3dYGbOkUjdRwKqpQKuTnap7ttnOTLPIIhTsijdcQDQeXQwPTXHVZwbZt4DjD1nEOKpTBQxLp82H39WydotAss7dJynCqjc6o48';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.TOKEN}`,
    });
    return this.http.get<any>(`${this.API_URL}/search`, {
      headers,
      params: {
        q: query,
        type: 'track',
      },
    });
  }
}
