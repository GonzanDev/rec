import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AlbumListComponent } from '../../components/album-list/album-list.component';
import { ArtistListComponent } from '../../components/artist-list/artist-list.component';
import { AuthStateService } from '../../components/auth/data-access/auth-state.service';
import { UserService } from '../../services/user.service';
import { SpotifyService } from '../../services/spotify.service';
import { filter, take, catchError } from 'rxjs/operators';
import { forkJoin, Subscription, Observable, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-library-page',
  imports: [NgIf, AlbumListComponent, ArtistListComponent],
  template: `
    <div class="library-container">
      <div class="library-header">
        <i class="fa fa-book"></i>
        <h2>{{ pageTitle }}</h2>
      </div>
      <p class="subtitle">Aquí está tu colección guardada.</p>

      <div class="library-content" *ngIf="section === 'saved'">
        <app-album-list layout="wrap" [albums]="albums"></app-album-list>
        <div class="no-results" *ngIf="!isLoading && albums.length === 0">
          <i class="fa fa-bookmark-o"></i>
          <p>No tienes álbumes guardados todavía.</p>
        </div>
      </div>

      <div class="library-content" *ngIf="section === 'following'">
        <app-artist-list *ngIf="artists.length > 0" [artists]="artists"></app-artist-list>
        <div class="no-results" *ngIf="!isLoading && artists.length === 0">
          <i class="fa fa-users"></i>
          <p>No sigues artistas todavía.</p>
        </div>
      </div>

      <div class="library-content" *ngIf="section === 'coming-soon'">
        <div class="no-results">
          <i class="fa fa-clock-o"></i>
          <p>Esta sección estará disponible próximamente.</p>
        </div>
      </div>

      <div class="library-content" *ngIf="isLoading">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando tu biblioteca...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .library-container {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      animation: fadeIn 0.4s ease-out;
    }
    .library-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;
    }
    .library-header i { font-size: 2.5rem; color: var(--verde); }
    .library-header h2 { font-size: 2.5rem; font-weight: 800; margin: 0; color: white; }
    .subtitle { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 40px; }

    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      padding: 3rem;
      text-align: center;
      gap: 10px;
    }
    .no-results i { font-size: 2.5rem; opacity: 0.5; }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: var(--text-muted);
      gap: 1rem;
    }
    .spinner {
      border: 3px solid rgba(255,255,255,0.1);
      border-top: 3px solid var(--verde);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  pageTitle: string = 'Tu Biblioteca';
  section: 'saved' | 'following' | 'coming-soon' = 'saved';

  albums: any[] = [];
  artists: any[] = [];
  isLoading: boolean = true;

  private authState = inject(AuthStateService);
  private userService = inject(UserService);
  private spotifyService = inject(SpotifyService);

  private subscriptions: Subscription[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const url = this.router.url;
    if (url.includes('favorites')) {
      this.pageTitle = 'Canciones Favoritas';
      this.section = 'coming-soon';
      this.isLoading = false;
    } else if (url.includes('saved')) {
      this.pageTitle = 'Álbumes Guardados';
      this.section = 'saved';
    } else if (url.includes('following')) {
      this.pageTitle = 'Artistas que Sigues';
      this.section = 'following';
    } else if (url.includes('playlists')) {
      this.pageTitle = 'Mis Playlists';
      this.section = 'coming-soon';
      this.isLoading = false;
    }

    if (this.section !== 'coming-soon') {
      this.loadLibrary();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadLibrary() {
    const sub = this.authState.authState$.pipe(
      filter(auth => !!auth),
      take(1)
    ).subscribe(auth => {
      const uid = auth.uid;
      this.userService.getUserProfile(uid).pipe(take(1)).subscribe({
        next: (profile) => {
          if (this.section === 'saved') {
            this.loadFavoriteAlbums(profile?.favoriteAlbums || []);
          } else if (this.section === 'following') {
            this.loadFavoriteArtists(profile?.favoriteArtists || []);
          }
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.isLoading = false;
        }
      });
    });

    this.subscriptions.push(sub);
  }

  private loadFavoriteAlbums(albumIds: string[]) {
    if (albumIds.length === 0) {
      this.isLoading = false;
      return;
    }

    const requests: Observable<any>[] = albumIds.map((albumId: string) =>
      this.spotifyService.getAlbumDetails(albumId).pipe(
        catchError(error => {
          console.error('Error fetching album:', albumId, error);
          return of(null);
        })
      )
    );

    const sub = forkJoin(requests).subscribe({
      next: (albums: any[]) => {
        this.albums = albums.filter(album => album !== null);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error in forkJoin (albums):', error);
        this.isLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  private loadFavoriteArtists(artistIds: string[]) {
    if (artistIds.length === 0) {
      this.isLoading = false;
      return;
    }

    const requests: Observable<any>[] = artistIds.map((artistId: string) =>
      this.spotifyService.getArtistDetails(artistId).pipe(
        catchError(error => {
          console.error('Error fetching artist:', artistId, error);
          return of(null);
        })
      )
    );

    const sub = forkJoin(requests).subscribe({
      next: (artists: any[]) => {
        this.artists = artists.filter(artist => artist !== null);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error in forkJoin (artists):', error);
        this.isLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }
}
