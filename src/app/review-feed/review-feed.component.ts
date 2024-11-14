import { Component, inject, OnInit } from '@angular/core';
import { ReviewService, Review } from '../services/review.service';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, Observable } from 'rxjs';
import { SpotifyService } from '../services/spotify.service';
import { AuthStateService } from '../services/localstorage.service';

@Component({
  selector: 'app-review-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-feed.component.html',
  styleUrls: ['./review-feed.component.css']
})
export class ReviewFeedComponent implements OnInit {
  reviews: Review[] = [];
  usersInfo: any[] = [];
  albumsInfo: any[] = [];
  isLoading: boolean = true;
  currentUser: any = null;

  private reviewService = inject(ReviewService);
  private spotifyService = inject(SpotifyService);
  private authState = inject(AuthStateService);

  ngOnInit(): void {
    this.authState.authState$.subscribe(authState => {
      if (authState) {
        this.currentUser = authState;

        // Obtener todas las reseñas
        this.reviewService.getAllReviews().pipe(
          catchError(error => {
            console.error('Error al obtener las reseñas:', error);
            this.isLoading = false;
            return [];
          })
        ).subscribe(reviews => {
          this.reviews = reviews;

          // Imprimir las reseñas después de haber sido asignadas
          console.log(this.reviews[1]);  // Ahora esto debería mostrar la segunda reseña correctamente.

          // Obtener datos de usuarios y álbumes
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
        });
      } else {
        console.error('Usuario no autenticado');
        this.isLoading = false;
      }
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
}
