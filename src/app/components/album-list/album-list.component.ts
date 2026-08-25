import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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
  @Input() layout: 'sidebar' | 'grid' | 'wrap' = 'grid';
  @Input() listType: 'featured' | 'top50' | 'new' = 'featured';
  @ViewChild('carousel') carousel!: ElementRef;

  isDragging = false;
  startX = 0;
  scrollLeftPos = 0;

  isLoading = false;
  hasError = false;

  // true si el padre nos está pasando `[albums]` explícitamente (aunque
  // todavía esté vacío porque carga async, como en "Álbumes Guardados").
  // Angular dispara ngOnChanges con esta key apenas hay un binding en el
  // template, exista o no valor todavía — a diferencia de artistId/albums
  // sin bindear, que nunca generan un ngOnChanges.
  private albumsBoundByParent = false;

  private lastLoad: (() => void) | null = null;

  constructor(
    private spotifyService: SpotifyService,
    private router: Router
  ) {}

  ngOnInit() {
    // Si nadie nos pasó álbumes ni un artista puntual, somos un widget de
    // "descubrí música" (sidebar derecho / Explorar): siempre cargamos según
    // listType, sin importar en qué página estemos. Antes esto dependía de
    // la ruta actual, así que apenas navegabas (o refrescabas con F5) a
    // cualquier página que no fuera /home o /explore, el widget se quedaba
    // vacío para siempre sin loading ni error.
    if (!this.artistId && !this.albumsBoundByParent) {
      this.loadByListType();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['albums']) {
      this.albumsBoundByParent = true;
    }
    if (changes['artistId'] && this.artistId) {
      this.loadAlbumsByArtist();
    }
  }

  private loadByListType() {
    if (this.listType === 'top50') {
      this.loadTrendingAlbums();
    } else if (this.listType === 'new') {
      this.loadNewReleases();
    } else {
      this.loadFeaturedAlbums();
    }
  }

  private loadNewReleases() {
    this.lastLoad = () => this.loadNewReleases();
    this.runLoad(this.spotifyService.getNewReleases(), 'new releases');
  }

  private loadFeaturedAlbums() {
    this.lastLoad = () => this.loadFeaturedAlbums();
    this.runLoad(this.spotifyService.getFeaturedAlbums(), 'featured albums');
  }

  private loadTrendingAlbums() {
    this.lastLoad = () => this.loadTrendingAlbums();
    this.runLoad(this.spotifyService.getTrendingAlbums(), 'trending albums');
  }

  private loadAlbumsByArtist() {
    if (this.artistId) {
      this.lastLoad = () => this.loadAlbumsByArtist();
      this.runLoad(this.spotifyService.getAlbumsByArtist(this.artistId), 'albums by artist');
    }
  }

  private runLoad(source: Observable<any[]>, label: string) {
    this.isLoading = true;
    this.hasError = false;
    source.subscribe({
      next: (albums) => {
        this.albums = albums;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error fetching ${label}:`, error);
        this.isLoading = false;
        this.hasError = true;
      },
    });
  }

  retry() {
    this.lastLoad?.();
  }

private stepFor(container: HTMLElement): number {
  if (this.layout === 'sidebar') {
    return container.clientWidth + 10;
  }
  // 160px width + 10px gap = 170px
  const visibleCards = Math.max(1, Math.floor(container.clientWidth / 170));
  return visibleCards * 170;
}

scrollLeft() {
  const container = this.carousel.nativeElement;
  const step = this.stepFor(container);
  const maxScroll = container.scrollWidth - container.clientWidth;
  const target = container.scrollLeft <= 10 ? maxScroll : Math.max(0, container.scrollLeft - step);
  this.runCarouselScroll(container, target);
}

scrollRight() {
  const container = this.carousel.nativeElement;
  const step = this.stepFor(container);
  const maxScroll = container.scrollWidth - container.clientWidth;
  const target = container.scrollLeft >= maxScroll - 10 ? 0 : Math.min(maxScroll, container.scrollLeft + step);
  this.runCarouselScroll(container, target);
}

// Clickear varias veces seguidas mientras el scroll suave todavía está
// animando hacía que cada click nuevo leyera un scrollLeft "a mitad de
// camino" y recalculara mal el destino/el wrap-around, dejando el
// carrusel trabado a mitad de una portada. Mientras hay una animación en
// curso, ignoramos los clicks nuevos hasta que termine.
carouselLocked = false;

private runCarouselScroll(container: HTMLElement, target: number) {
  if (this.carouselLocked) return;
  this.carouselLocked = true;

  const unlock = () => {
    this.carouselLocked = false;
    container.removeEventListener('scrollend', unlock);
  };
  container.addEventListener('scrollend', unlock, { once: true });
  // Red de seguridad para navegadores sin soporte de `scrollend` (Safari
  // viejo) o si el scroll ya estaba en el destino y el evento no llega a disparar.
  setTimeout(unlock, 500);

  container.scrollTo({ left: target, behavior: 'smooth' });
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
