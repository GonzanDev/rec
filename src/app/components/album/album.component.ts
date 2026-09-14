import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { switchMap, filter, take } from 'rxjs/operators';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CreateReviewComponent } from '../create-review/create-review.component';
import { UserService } from '../../services/user.service';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { ReviewService, Review } from '../../services/review.service';
import { Subscription, combineLatest, catchError, of } from 'rxjs';
import { toast } from 'ngx-sonner';
import { AddToListComponent } from '../../components/add-to-list/add-to-list.component';

@Component({
  standalone: true,
  selector: 'app-album',
  imports: [NgFor, NgIf, RouterLink, CreateReviewComponent, CommonModule, AddToListComponent],
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css'],
})
export class AlbumComponent implements OnInit, OnDestroy {
  album: any = null;
  showReviewComponent = false;
  showAddToList = false;
  reviews: Review[] = [];
  userId: string = '';
  isFavorite: boolean = false;
  isLoading: boolean = true;
  showShareMenu: boolean = false;

  private subscriptions: Subscription[] = [];
  private authState = inject(AuthStateService);

  averageRating: number = 0;
  roundedAverage: number = 0;
  formattedAverage: string = '0,0';

  usersInfo: Map<string, any> = new Map(); // datos usuarios de reseñas
  usersLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private userService: UserService,
    private reviewService: ReviewService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Get current user
    const authSub = this.authState.authState$.pipe(
      filter(auth => auth !== undefined),
      take(1)
    ).subscribe(authState => {
      if (authState) {
        this.userId = authState.uid;
        // Check if album is favorite after we have both user and album
        if (this.album?.id) {
          this.checkIfFavorite();
        }
      }
    });
    this.subscriptions.push(authSub);

    // Get album details
    const routeSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const albumId = params.get('albumId');
          if (albumId) {
            return this.spotifyService.getAlbumDetails(albumId);
          }
          return [];
        })
      )
      .subscribe({
        next: (data) => {
          this.album = data;
          this.isLoading = false;
          // Check if favorite after we have album
          if (this.userId) {
            this.checkIfFavorite();
          }
          // Load reviews for this album
          this.loadAlbumReviews();
        },
        error: () => {
          this.isLoading = false;
          toast.error('Error al cargar el álbum');
        }
      });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  checkIfFavorite() {
    this.userService.getById(this.userId).then(user => {
      this.isFavorite = user?.favoriteAlbums?.includes(this.album.id) || false;
    }).catch(() => {});
  }

  loadAlbumReviews() {
    if (!this.album?.id) return;

    this.reviewService.getReviewsByAlbum(this.album.id).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.updateAverage();
        this.loadUsersDetails(reviews); // <--- Llamada a cargar usuarios
      },
      error: () => {}
    });
  }

// Nuevo método para obtener nombres de usuario (similar al feed)
  private loadUsersDetails(reviews: Review[]) {
    const userIds = [...new Set(reviews.map(r => r.userId))].filter(id => !this.usersInfo.has(id));
    
    if (userIds.length === 0) return;

    this.usersLoading = true;

    const userRequests = userIds.map(id =>
      this.reviewService.getUserById(id).pipe(catchError(() => of(null)))
    );

    combineLatest(userRequests).subscribe(users => {
      userIds.forEach((id, index) => {
        if (users[index]) {
          this.usersInfo.set(id, users[index]);
        }
      });

      this.usersLoading = false;
      // Ocultar reseñas cuyo autor no se pudo cargar (perfil privado o borrado).
      this.reviews = this.reviews.filter(review => this.usersInfo.has(review.userId));
      this.updateAverage();
    });
  }

  // Método auxiliar para el HTML
  getUserName(userId: string): string {
    return this.usersInfo.get(userId)?.username || 'Usuario...';
  }

  toggleFavorite() {
    if (!this.userId) {
      toast.error('Debes iniciar sesión');
      return;
    }

    if (!this.album?.id) {
      toast.error('Error al obtener el álbum');
      return;
    }

    if (this.isFavorite) {
      this.userService.removeFavoriteAlbum(this.userId, this.album.id)
        .then(() => {
          this.isFavorite = false;
          toast.success('Álbum eliminado de favoritos');
        })
        .catch(() => {
          toast.error('Error al eliminar de favoritos');
        });
    } else {
      this.userService.addFavoriteAlbum(this.userId, this.album.id)
        .then(() => {
          this.isFavorite = true;
          toast.success('Álbum agregado a favoritos');
        })
        .catch(() => {
          toast.error('Error al agregar a favoritos');
        });
    }
  }

  openReviewComponent() {
    if (!this.userId) {
      toast.error('Debes iniciar sesión para crear una reseña');
      return;
    }
    this.showReviewComponent = true;
  }

  closeReviewComponent(): void {
    this.showReviewComponent = false;
  }

  openAddToList() {
    if (!this.userId) {
      toast.error('Debes iniciar sesión');
      return;
    }
    this.showAddToList = true;
  }

  onReviewCreated(review: Review) {
    this.reviews.unshift(review); // Add to beginning of array
    this.updateAverage(); //  recalcula promedio
    this.closeReviewComponent();
    toast.success('Reseña creada');
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getTotalDuration(): string {
    if (!this.album?.tracks?.items) return '0:00';
    const totalMs = this.album.tracks.items.reduce((acc: number, track: any) => acc + track.duration_ms, 0);
    const minutes = Math.floor(totalMs / 60000);
    return `${minutes} min`;
  }

  toggleShareMenu() {
  this.showShareMenu = !this.showShareMenu;
}

closeShareMenu() {
  this.showShareMenu = false;
}

shareWhatsApp() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://wa.me/?text=${url}`, '_blank');
}

shareX() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`Mirá este álbum`);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

copyLink() {
  navigator.clipboard.writeText(window.location.href);
  toast.success('Link copiado al portapapeles');
}

private updateAverage(): void {
  if (!this.reviews || this.reviews.length === 0) {
    this.averageRating = 0;
    this.roundedAverage = 0;
    this.formattedAverage = '0,0';
    return;
  }

  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.averageRating = total / this.reviews.length;

  this.roundedAverage = Math.round(this.averageRating);

  this.formattedAverage = this.averageRating
    .toFixed(1)
    .replace('.', ',');
}

// ... dentro de la clase AlbumComponent

toggleLike(review: Review) {
  if (!review.id || !this.userId) {
    toast.error('Debes iniciar sesión para dar like');
    return;
  }

  // Lógica Optimista: Actualizamos la UI antes de la respuesta del servidor
  const currentLikes = review.likes || [];
  const isLiked = currentLikes.includes(this.userId);

  if (isLiked) {
    // Quitar Like
    review.likes = currentLikes.filter(id => id !== this.userId);
    this.reviewService.removeLike(review.id, this.userId)
      .catch(() => {
        review.likes = currentLikes; // Revertir si falla
      });
  } else {
    // Dar Like
    review.likes = [...currentLikes, this.userId];
    this.reviewService.addLike(review.id, this.userId)
      .catch(() => {
        review.likes = currentLikes; // Revertir si falla
      });
  }
}

// Método auxiliar para saber si el usuario actual dio like
isLiked(review: Review): boolean {
  return review.likes?.includes(this.userId) || false;
}

// El usuario ya reseñó este álbum: el ícono de "Reseñar" se pinta de verde,
// gris (color por defecto) si todavía no.
hasReviewed(): boolean {
  return this.reviews.some(review => review.userId === this.userId);
}

}
