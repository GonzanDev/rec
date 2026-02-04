import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { NgFor } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-album-list',
  imports:[NgFor],
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.css'],
})
export class AlbumListComponent implements OnInit, OnChanges {
  @Input() artistId?: string;
  @Input() albums: any[] = [];
  @Input() favoriteAlbums: any[] = [];
  @ViewChild('carousel') carousel!: ElementRef;

  currentRoute: string = '';

  constructor(
    private spotifyService: SpotifyService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.detectRoute();  // Detectar la ruta actual al iniciar
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['artistId'] && this.artistId) {
      this.loadAlbumsByArtist();
    }
  }

  private detectRoute() {
    this.currentRoute = this.router.url;  // Obtener la URL actual

    // Verificar la ruta y cargar los álbumes correspondientes
    if (this.currentRoute.startsWith('/home')) {
      this.loadTopAlbums(); // Si estamos en la home, cargar los álbumes principales
    } else if (this.currentRoute.startsWith('/user')) {
      this.loadFavoriteAlbums(); // Si estamos en la página de un usuario, cargar los álbumes favoritos
    } else if (this.currentRoute.startsWith('/artist')) {
      if (this.artistId) {
        this.loadAlbumsByArtist(); // Si estamos en la página de un artista, cargar los álbumes del artista
      }
    }
  }

  private loadTopAlbums() {
    this.spotifyService.getTopAlbums().subscribe({
      next: (albums) => {
        this.albums = albums;
      },
      error: (error) => {
        console.error('Error fetching top albums:', error);
      },
    });
  }

  private loadFavoriteAlbums() {
    if (this.favoriteAlbums.length > 0) {
      this.albums = this.favoriteAlbums; // Si hay álbumes favoritos, mostrarlos
    } else {
      console.log('No se encontraron álbumes favoritos');
    }
  }

  private loadAlbumsByArtist() {
    if (this.artistId) {
      this.spotifyService.getAlbumsByArtist(this.artistId).subscribe({
        next: (albums) => {
          this.albums = albums;
        },
        error: (error) => {
          console.error('Error fetching albums by artist:', error);
        },
      });
    }
  }

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  viewAlbumDetails(albumId: string) {
    this.router.navigate([`/album`, albumId]);
  }
}
