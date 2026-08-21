import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlbumListComponent } from '../../components/album-list/album-list.component';

@Component({
  standalone: true,
  selector: 'app-library-page',
  imports: [AlbumListComponent],
  template: `
    <div class="library-container">
      <div class="library-header">
        <i class="fa fa-book"></i>
        <h2>{{ pageTitle }}</h2>
      </div>
      <p class="subtitle">Aquí está tu colección guardada.</p>
      
      <div class="library-content">
        <app-album-list layout="wrap"></app-album-list>
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
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LibraryPageComponent implements OnInit {
  pageTitle: string = 'Tu Biblioteca';

  constructor(private router: Router) {}

  ngOnInit() {
    const url = this.router.url;
    if (url.includes('favorites')) this.pageTitle = 'Canciones Favoritas';
    else if (url.includes('saved')) this.pageTitle = 'Álbumes Guardados';
    else if (url.includes('following')) this.pageTitle = 'Artistas que Sigues';
    else if (url.includes('playlists')) this.pageTitle = 'Mis Playlists';
  }
}
