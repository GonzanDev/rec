import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { SpotifyService } from '../../services/spotify.service';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { AlbumListComponent } from '../album-list/album-list.component';
import { ArtistListComponent } from '../artist-list/artist-list.component';
import { ReviewFeedComponent } from '../review-feed/review-feed.component';
import { catchError, filter, take, timeout } from 'rxjs/operators';
import { combineLatest, Subscription, forkJoin, Observable, of } from 'rxjs';
import { ReviewService } from '../../services/review.service';
import { ListService, MusicList } from '../../services/list.service';
import { ListCardComponent } from '../list-card/list-card.component';
import { toast } from 'ngx-sonner';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [NgIf, NgFor, NgClass, AlbumListComponent, ArtistListComponent, ReviewFeedComponent, ListCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
   userId: string = '';
  currentUserId: string = '';
  private authState = inject(AuthStateService);
  private subscriptions: Subscription[] = [];

  private reviewService = inject(ReviewService);
  private listService = inject(ListService);

  lists: MusicList[] = [];

  // Variables para la comparación
comparisonResults: any[] = [];
showComparison: boolean = false;
isComparing: boolean = false;

  user: any = null;
  favoriteAlbumsDetails: any[] = [];
  favoriteArtistsDetails: any[] = [];
  isFollowing: boolean = false;
  isLoading: boolean = true;
  isPrivateBlocked: boolean = false;
  requestSent: boolean = false;
  isSendingRequest: boolean = false;
  followRequests: { id: string; username: string }[] = [];

  stats = {
    total: 0,
    average: 0,
    distribution: [0, 0, 0, 0, 0],
    topRating: 0,
    topAlbumName: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit(): void {
  const sub = combineLatest([
    this.authState.authState$.pipe(
      filter(auth => auth !== undefined),
      take(1)
    ),
    this.route.paramMap
  ]).subscribe(([authState, params]) => {
    if (authState) {
      this.currentUserId = authState.uid;
    }

    this.userId = params.get('userId')!;
    this.loadUserProfile(this.userId);
  });

  this.subscriptions.push(sub);
}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadUserProfile(userId: string): void {
    this.isLoading = true;

    // Use take(1) to avoid re-fetching on document changes
    const sub = this.userService.getUserProfile(userId).pipe(take(1)).subscribe({
      next: (userProfile) => {
        this.user = userProfile;
        this.isLoading = false;

        if (this.user?.favoriteAlbums?.length > 0) {
          this.getFavoriteAlbumsDetails();
        }

        if (this.user?.favoriteArtists?.length > 0) {
          this.getFavoriteArtistsDetails();
        }

        this.checkIfFollowing();
        this.loadStats();
        this.loadLists();
        this.loadFollowRequests();
      },
      error: (error) => {
        this.isLoading = false;
        this.isPrivateBlocked = error?.code === 'permission-denied';
      }
    });

    this.subscriptions.push(sub);
  }

getFavoriteArtistsDetails() {
  this.favoriteArtistsDetails = [];

  const artistRequests: Observable<any>[] = this.user.favoriteArtists.map((artistId: string) => {
    return this.spotifyService.getArtistDetails(artistId).pipe(
      timeout(10000),
      catchError(() => of(null))
    );
  });

  forkJoin(artistRequests).subscribe({
    next: (artists: any[]) => {
      this.favoriteArtistsDetails = artists.filter(artist => artist !== null);
    },
    error: () => {}
  });
}

getFavoriteAlbumsDetails() {
  this.favoriteAlbumsDetails = [];

  const albumRequests: Observable<any>[] = this.user.favoriteAlbums.map((albumId: string) => {
    return this.spotifyService.getAlbumDetails(albumId).pipe(
      catchError(() => of(null))
    );
  });

  forkJoin(albumRequests).subscribe({
    next: (albums: any[]) => {
      this.favoriteAlbumsDetails = albums.filter(album => album !== null);
    },
    error: () => {}
  });
}

  loadStats() {
    this.reviewService.getReviewsByUser(this.userId).then((reviews) => {
      const total = reviews.length;
      const distribution = [0, 0, 0, 0, 0];

      let sum = 0;
      let topReview: any = null;

      reviews.forEach((review) => {
        sum += review.rating;
        if (review.rating >= 1 && review.rating <= 5) {
          distribution[review.rating - 1]++;
        }

        if (!topReview || review.rating > topReview.rating) {
          topReview = review;
        }
      });

      this.stats.total = total;
      this.stats.average = total > 0 ? sum / total : 0;
      this.stats.distribution = distribution;
      this.stats.topRating = topReview?.rating || 0;

      if (topReview?.albumId) {
        const sub = this.spotifyService.getAlbumDetails(topReview.albumId).subscribe({
          next: (album) => {
            this.stats.topAlbumName = album?.name || '';
          },
          error: () => {
            this.stats.topAlbumName = '';
          }
        });
        this.subscriptions.push(sub);
      }
    }).catch(() => {});
  }

  loadLists() {
    const lists$ =
      this.userId === this.currentUserId
        ? this.listService.getByUser(this.userId)
        : this.listService.getPublicByUser(this.userId);

    const sub = lists$.subscribe({
      next: (lists) => {
        this.lists = lists;
      },
      error: (error) => {
        // permission-denied es esperable acá: o el usuario cerró sesión mientras
        // este componente seguía montado, o el perfil es privado. En ambos casos
        // no tiene sentido molestar con un toast.
        if (error?.code !== 'permission-denied') {
          toast.error('Error al cargar las listas: ' + (error?.message || error?.code || 'error desconocido'));
        }
      },
    });
    this.subscriptions.push(sub);
  }

  checkIfFollowing() {
    if (this.user && this.currentUserId) {
      this.userService.isFollowing(this.currentUserId, this.userId).subscribe((isFollowing) => {
        this.isFollowing = isFollowing;
      });
    }
  }

  followUser() {
    if (this.currentUserId && this.userId) {
      this.userService.addFollower(this.userId, this.currentUserId).then(() => {
        this.isFollowing = true; // Actualizar estado a "siguiendo"
      }).catch(() => {});
    }
  }

  unfollowUser() {
    if (this.currentUserId && this.userId) {
      this.userService.removeFollower(this.userId, this.currentUserId).then(() => {
        this.isFollowing = false; // Actualizar estado a "no siguiendo"
      }).catch(() => {});
    }
  }

  loadFollowRequests() {
    const ids = this.user?.followRequests || [];
    if (ids.length === 0) {
      this.followRequests = [];
      return;
    }

    const requests: Observable<any>[] = ids.map((id: string) =>
      this.userService.getUserProfile(id).pipe(catchError(() => of(null)))
    );

    forkJoin(requests).subscribe((users: any[]) => {
      this.followRequests = ids.map((id: string, index: number) => ({
        id,
        username: users[index]?.username || 'Usuario',
      }));
    });
  }

  sendFollowRequest() {
    if (!this.currentUserId || !this.userId) return;
    this.isSendingRequest = true;
    this.userService.requestFollow(this.userId, this.currentUserId).then(() => {
      this.requestSent = true;
      this.isSendingRequest = false;
    }).catch(() => {
      this.isSendingRequest = false;
      toast.error('No se pudo enviar la solicitud');
    });
  }

  acceptFollowRequest(requesterId: string) {
    if (!this.userId) return;
    this.userService.acceptFollowRequest(this.userId, requesterId).then(() => {
      this.user.followers = [...(this.user.followers || []), requesterId];
      this.user.followRequests = (this.user.followRequests || []).filter((id: string) => id !== requesterId);
      this.followRequests = this.followRequests.filter((r) => r.id !== requesterId);
      toast.success('Solicitud aceptada');
    }).catch(() => {
      toast.error('Error al aceptar la solicitud');
    });
  }

  declineFollowRequest(requesterId: string) {
    if (!this.userId) return;
    this.userService.declineFollowRequest(this.userId, requesterId).then(() => {
      this.user.followRequests = (this.user.followRequests || []).filter((id: string) => id !== requesterId);
      this.followRequests = this.followRequests.filter((r) => r.id !== requesterId);
    }).catch(() => {
      toast.error('Error al rechazar la solicitud');
    });
  }

  async compareProfiles() {
  this.isComparing = true;
  this.showComparison = true;
  this.comparisonResults = [];

  try {
    // 1. Obtenemos las reseñas de ambos en paralelo
    const [viewedUserReviews, currentUserReviews] = await Promise.all([
      this.reviewService.getReviewsByUser(this.userId),
      this.reviewService.getReviewsByUser(this.currentUserId)
    ]);

    // 2. Buscamos coincidencias por albumId
    const matches = viewedUserReviews.filter(review => 
      currentUserReviews.some(currReview => currReview.albumId === review.albumId)
    );

    // 3. Mapeamos los resultados cruzados
    const detailedMatches = await Promise.all(matches.map(async (viewedReview) => {
      const myReview = currentUserReviews.find(r => r.albumId === viewedReview.albumId);
      
      // Buscamos detalles del álbum en Spotify para que se vea lindo
      const albumInfo = await this.spotifyService.getAlbumDetails(viewedReview.albumId).toPromise();

      return {
        albumName: albumInfo?.name,
        albumCover: albumInfo?.images[2]?.url,
        viewedUser: {
          rating: viewedReview.rating,
          comment: viewedReview.comment
        },
        currentUser: {
          rating: myReview?.rating,
          comment: myReview?.comment
        }
      };
    }));

    this.comparisonResults = detailedMatches;
  } catch {
  } finally {
    this.isComparing = false;
  }
}
}
