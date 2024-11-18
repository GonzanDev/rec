import { Component, inject, Input, OnInit } from '@angular/core';
import { ReviewService, Review } from '../services/review.service';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, from, Observable } from 'rxjs';
import { SpotifyService } from '../services/spotify.service';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './review-feed.component.html',
  styleUrls: ['./review-feed.component.css']
})
export class ReviewFeedComponent implements OnInit {
  @Input() userId: string = '';  // userId puede estar vacío para la página de inicio
  reviews: Review[] = [];
  usersInfo: any[] = [];
  albumsInfo: any[] = [];
  isLoading: boolean = true;
  currentUser: any = null;
  newCommentContent: { [key: string]: string } = {};
  @Input() individualTextFields: boolean = false;

  private reviewService = inject(ReviewService);
  private spotifyService = inject(SpotifyService);
  private authState = inject(AuthStateService);

  ngOnInit(): void {
    this.authState.authState$.subscribe(authState => {
      if (authState) {
        this.currentUser = authState;

        if (this.userId) {
          // Si hay un userId, obtenemos las reseñas del usuario específico
          from(this.reviewService.getReviewsByUser(this.userId)).pipe(
            catchError(error => {
              console.error('Error al obtener las reseñas:', error);
              this.isLoading = false;
              return [];
            })
          ).subscribe(reviews => {
            this.reviews = reviews.map(review => review as Review);
            this.loadUserAndAlbumDetails(this.reviews);
          });
        } else {
          // Si no hay userId, obtenemos todas las reseñas y las ordenamos por timestamp
          this.reviewService.getAllReviews().pipe(
            catchError(error => {
              console.error('Error al obtener las reseñas:', error);
              this.isLoading = false;
              return [];
            })
          ).subscribe(reviews => {
            this.reviews = reviews.sort((a, b) => (b.timestamp as unknown as number) - (a.timestamp as unknown as number));
            this.loadUserAndAlbumDetails(reviews);
          });
        }
      } else {
        console.error('Usuario no autenticado');
        this.isLoading = false;
      }
    });
  }

  // Método para cargar la información de los usuarios y álbumes
  private loadUserAndAlbumDetails(reviews: Review[]) {
    const userRequests: Observable<any>[] = [];
    const albumRequests: Observable<any>[] = [];
    reviews.forEach(review => {
      userRequests.push(this.reviewService.getUserById(review.userId));
      albumRequests.push(this.spotifyService.getAlbumDetails(review.albumId));
    });

    combineLatest([...userRequests, ...albumRequests]).pipe(
      catchError(error => {
        console.error('Error al obtener los detalles:', error);
        return [];
      })
    ).subscribe((responses) => {
      const users = responses.slice(0, reviews.length);
      const albums = responses.slice(reviews.length);
      this.usersInfo = users;
      this.albumsInfo = albums;
      this.isLoading = false;
    });
  }

  // Obtener información del álbum por índice
  getAlbumInfo(index: number): any {
    return this.albumsInfo[index];
  }

  // Obtener información del usuario por índice
  getUserInfo(index: number): any {
    return this.usersInfo[index];
  }

  // Verificar si la reseña tiene like del usuario actual
  isLikedByUser(review: Review): boolean {
    return review.likes?.includes(this.currentUser?.uid) || false;
  }

  toggleLike(review: Review) {
    if (!review.id || !this.currentUser?.uid) return;

    if (review.likes?.includes(this.currentUser.uid)) {
      this.reviewService.removeLike(review.id, this.currentUser.uid)
        .then(() => {
          console.log('Like removed successfully');
        })
        .catch(error => {
          if (error.code === 'permission-denied') {
            console.error('No tienes permisos para realizar esta acción');
          } else {
            console.error('Error al quitar like:', error);
          }
        });
    } else {
      this.reviewService.addLike(review.id, this.currentUser.uid)
        .then(() => {
          console.log('Like added successfully');
        })
        .catch(error => {
          if (error.code === 'permission-denied') {
            console.error('No tienes permisos para realizar esta acción');
          } else {
            console.error('Error al dar like:', error);
          }
        });
    }
  }

  getUserName(userId: string): string {
    const user = this.usersInfo.find(u => u.id === userId);
    return user?.username || 'Unknown User';
  }

  addCommentToReview(reviewId: string, comment: string) {
    if (!comment?.trim()) return;

    this.reviewService.addComment(reviewId, this.currentUser.uid, comment)
      .then(() => {
        this.newCommentContent[reviewId] = '';  // Use the existing newCommentContent object instead
      })
      .catch(error => console.error('Error al agregar comentario:', error));
  }
}
