import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { switchMap, filter, take } from 'rxjs/operators';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CreateReviewComponent } from '../create-review/create-review.component';
import { UserService } from '../../services/user.service';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { ReviewService, Review } from '../../services/review.service';
import { Subscription } from 'rxjs';
import { toast } from 'ngx-sonner';

@Component({
  standalone: true,
  selector: 'app-album',
  imports: [NgFor, NgIf, RouterLink, CreateReviewComponent, CommonModule],
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css'],
})
export class AlbumComponent implements OnInit, OnDestroy {
  album: any = null;
  showReviewComponent = false;
  reviews: Review[] = [];
  userId: string = '';
  isFavorite: boolean = false;
  isLoading: boolean = true;

  private subscriptions: Subscription[] = [];
  private authState = inject(AuthStateService);

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private userService: UserService,
    private reviewService: ReviewService
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
        error: (error) => {
          console.error('Error fetching album details:', error);
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
    }).catch(error => {
      console.error('Error checking favorite:', error);
    });
  }

  loadAlbumReviews() {
    if (!this.album?.id) return;

    this.reviewService.getReviewsByAlbum(this.album.id).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      }
    });
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
        .catch((error) => {
          console.error('Error:', error);
          toast.error('Error al eliminar de favoritos');
        });
    } else {
      this.userService.addFavoriteAlbum(this.userId, this.album.id)
        .then(() => {
          this.isFavorite = true;
          toast.success('Álbum agregado a favoritos');
        })
        .catch((error) => {
          console.error('Error:', error);
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

  onReviewCreated(review: Review) {
    this.reviews.unshift(review); // Add to beginning of array
    this.closeReviewComponent();
    toast.success('Reseña creada');
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getTotalDuration(): string {
    if (!this.album?.tracks?.items) return '0:00';
    const totalMs = this.album.tracks.items.reduce((acc: number, track: any) => acc + track.duration_ms, 0);
    const minutes = Math.floor(totalMs / 60000);
    return `${minutes} min`;
  }
}
