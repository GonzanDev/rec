import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-album-list',
  imports:[NgFor, NgClass, NgIf],
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.css'],
})
export class AlbumListComponent implements OnInit, OnChanges {
  @Input() artistId?: string;
  @Input() albums: any[] = [];
  @Input() favoriteAlbums: any[] = [];
  @Input() layout: 'sidebar' | 'grid' | 'wrap' = 'grid';
  @Input() listType: 'top' | 'top50' = 'top';
  @ViewChild('carousel') carousel!: ElementRef;

  currentRoute: string = '';
  isDragging = false;
  startX = 0;
  scrollLeftPos = 0;

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
    this.currentRoute = this.router.url;

    // Verificar la ruta y cargar los álbumes correspondientes
    if (this.currentRoute.startsWith('/home') || this.currentRoute.startsWith('/explore')) {
      if (this.listType === 'top50') {
        this.loadTrendingAlbums();
      } else {
        this.loadTopAlbums();
      }
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

  private loadTrendingAlbums() {
    this.spotifyService.getTrendingAlbums().subscribe({
      next: (albums) => {
        this.albums = albums;
      },
      error: (error) => {
        console.error('Error fetching trending albums:', error);
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
  const container = this.carousel.nativeElement;
  let step = 0;
  if (this.layout === 'sidebar') {
    step = container.clientWidth + 10;
  } else {
    // 160px width + 10px gap = 170px
    const visibleCards = Math.max(1, Math.floor(container.clientWidth / 170));
    step = visibleCards * 170;
  }

  if (container.scrollLeft <= 10) {
    const maxScroll = container.scrollWidth - container.clientWidth;
    container.scrollTo({ left: maxScroll, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: -step, behavior: 'smooth' });
  }
}

scrollRight() {
  const container = this.carousel.nativeElement;
  let step = 0;
  if (this.layout === 'sidebar') {
    step = container.clientWidth + 10;
  } else {
    const visibleCards = Math.max(1, Math.floor(container.clientWidth / 170));
    step = visibleCards * 170;
  }

  const maxScroll = container.scrollWidth - container.clientWidth;
  if (container.scrollLeft >= maxScroll - 10) {
    container.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: step, behavior: 'smooth' });
  }
}

onMouseDown(e: MouseEvent) {
  this.isDragging = true;
  const container = this.carousel.nativeElement;
  container.style.scrollSnapType = 'none'; // Disable snap while dragging
  this.startX = e.pageX - container.offsetLeft;
  this.scrollLeftPos = container.scrollLeft;
}

onMouseLeave() {
  this.isDragging = false;
  this.carousel.nativeElement.style.scrollSnapType = 'x mandatory';
}

onMouseUp() {
  this.isDragging = false;
  this.carousel.nativeElement.style.scrollSnapType = 'x mandatory';
}

onMouseMove(e: MouseEvent) {
  if (!this.isDragging) return;
  e.preventDefault();
  const container = this.carousel.nativeElement;
  const x = e.pageX - container.offsetLeft;
  const walk = (x - this.startX) * 1.5; // Multiplicador de velocidad
  container.scrollLeft = this.scrollLeftPos - walk;
}

  viewAlbumDetails(albumId: string) {
    this.router.navigate([`/album`, albumId]);
  }
}
