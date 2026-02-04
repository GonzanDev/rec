import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ReviewService, Review } from '../../services/review.service';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, from, Observable, Subscription, of, map } from 'rxjs';
import { SpotifyService } from '../../services/spotify.service';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { filter, take } from 'rxjs/operators';
import { ReviewComponent } from '../review/review.component';


@Component({
  selector: 'app-review-feed',
  standalone: true,
  imports: [CommonModule, ReviewComponent],
  templateUrl: './review-feed.component.html',
  styleUrls: ['./review-feed.component.css']
})
export class ReviewFeedComponent implements OnInit, OnDestroy {
  @Input() userId: string = '';
  reviews: Review[] = [];
  usersInfo: Map<string, any> = new Map();
  albumsInfo: Map<string, any> = new Map();
  isLoading: boolean = true;
  currentUser: any = null;
  @Input() individualTextFields: boolean = false;

  private reviewService = inject(ReviewService);
  private spotifyService = inject(SpotifyService);
  private authState = inject(AuthStateService);

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {

    const authSub = this.authState.authState$.pipe(
      filter(auth => auth !== undefined),
      take(1)
    ).subscribe(authState => {
      if (authState) {
        this.currentUser = authState;
        this.loadReviews();
      } else {
        console.error('Usuario no autenticado');
        this.isLoading = false;
      }
    });

    this.subscriptions.push(authSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadReviews(): void {
    let reviewsObservable: Observable<Review[]>;

    if (this.userId) {
      reviewsObservable = from(this.reviewService.getReviewsByUser(this.userId)).pipe(
        catchError(error => {
          console.error('Error al obtener las reseñas:', error);
          return of([]);
        })
      );
    } else {
      reviewsObservable = this.reviewService.getAllReviews().pipe(
        map(docs => docs as Review[]),
        catchError(error => {
          console.error('Error al obtener las reseñas:', error);
          return of([]);
        })
      );
    }

    const reviewSub = reviewsObservable.subscribe(reviews => {
      this.reviews = reviews.sort((a, b) =>
        (b.timestamp as unknown as number) - (a.timestamp as unknown as number)
      );
      this.loadUserAndAlbumDetails(this.reviews);
    });

    this.subscriptions.push(reviewSub);
  }

  private loadUserAndAlbumDetails(reviews: Review[]) {
    if (reviews.length === 0) {
      this.isLoading = false;
      return;
    }

    // Get unique user and album IDs that we don't already have cached
    const userIds = [...new Set(reviews.map(r => r.userId))].filter(id => !this.usersInfo.has(id));
    const albumIds = [...new Set(reviews.map(r => r.albumId))].filter(id => !this.albumsInfo.has(id));

    const userRequests: Observable<any>[] = userIds.map(id =>
      this.reviewService.getUserById(id).pipe(catchError(() => of(null)))
    );
    const albumRequests: Observable<any>[] = albumIds.map(id =>
      this.spotifyService.getAlbumDetails(id).pipe(catchError(() => of(null)))
    );

    if (userRequests.length === 0 && albumRequests.length === 0) {
      this.isLoading = false;
      return;
    }

    combineLatest([
      userRequests.length > 0 ? combineLatest(userRequests) : of([]),
      albumRequests.length > 0 ? combineLatest(albumRequests) : of([])
    ]).subscribe(([users, albums]) => {
      // Cache user info
      userIds.forEach((id, index) => {
        if (users[index]) {
          this.usersInfo.set(id, users[index]);
        }
      });

      // Cache album info
      albumIds.forEach((id, index) => {
        if (albums[index]) {
          this.albumsInfo.set(id, albums[index]);
        }
      });

      this.isLoading = false;
    });
  }

  // Get album info from cache
  getAlbumInfo(index: number): any {
    const review = this.reviews[index];
    return review ? this.albumsInfo.get(review.albumId) : null;
  }

  // Get user info from cache
  getUserInfo(index: number): any {
    const review = this.reviews[index];
    return review ? this.usersInfo.get(review.userId) : null;
  }

  toggleLike(review: Review) {
    if (!review.id || !this.currentUser?.uid) return;

    // Optimistic update - update UI immediately
    const currentLikes = review.likes || [];
    const isLiked = currentLikes.includes(this.currentUser.uid);

    if (isLiked) {
      review.likes = currentLikes.filter(id => id !== this.currentUser.uid);
      this.reviewService.removeLike(review.id, this.currentUser.uid)
        .catch(error => {
          // Revert on error
          review.likes = currentLikes;
          console.error('Error al quitar like:', error);
        });
    } else {
      review.likes = [...currentLikes, this.currentUser.uid];
      this.reviewService.addLike(review.id, this.currentUser.uid)
        .catch(error => {
          // Revert on error
          review.likes = currentLikes;
          console.error('Error al dar like:', error);
        });
    }
  }

  getUserName(userId: string): string {
    const user = this.usersInfo.get(userId);
    return user?.username || 'Unknown User';
  }

  addCommentToReview(reviewId: string, comment: string) {
    if (!comment?.trim()) return;

    this.reviewService.addComment(reviewId, this.currentUser.uid, comment)
      .catch(error => console.error('Error al agregar comentario:', error));
  }
}
