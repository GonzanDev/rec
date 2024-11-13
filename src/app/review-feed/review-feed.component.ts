import { Component, inject, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Review } from '../services/review.service';
import { CommonModule } from '@angular/common'; // Asegúrate de importar CommonModule para usar directivas como *ngFor
import { catchError, combineLatest, Observable } from 'rxjs';
import { SpotifyService } from '../services/spotify.service';
import { AuthStateService } from '../services/localstorage.service';

@Component({
  selector: 'app-review-feed',
  standalone: true,
  imports: [CommonModule], // Importar CommonModule para usar *ngFor y otras directivas
  templateUrl: './review-feed.component.html',
  styleUrls: ['./review-feed.component.css']
})
export class ReviewFeedComponent implements OnInit {
  reviews: Review[] = [];
  usersInfo: any[] = [];
  albumsInfo: any[] = [];

  private reviewService = inject(ReviewService);
  private spotifyService = inject(SpotifyService);
  private authState = inject(AuthStateService);
  isLoading: boolean = true;
  currentUser: any = null;

  ngOnInit(): void {
    // Suscripción al estado de autenticación
    this.authState.authState$.subscribe(authState => {
      if (authState) {
        // Si el usuario está autenticado
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

          // Usamos combineLatest para obtener los datos del usuario y del álbum
          const userRequests: Observable<any>[] = [];
          const albumRequests: Observable<any>[] = [];

          reviews.forEach(review => {
            userRequests.push(this.reviewService.getUserById(review.userId));  // Obtener info del usuario
            albumRequests.push(this.spotifyService.getAlbumDetails(review.albumId));  // Obtener info del álbum
          });

          // Combinar las respuestas de los usuarios y los álbumes
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
            this.isLoading = false;  // Fin de la carga
          });
        });
      } else {
        // Si el usuario no está autenticado
        console.error('Usuario no autenticado');
        this.isLoading = false;  // Fin de la carga, no se muestran reseñas
      }
    });
  }


  // Método para obtener la información de un álbum por su índice
  getAlbumInfo(index: number): any {
    return this.albumsInfo[index];
  }

  // Método para obtener la información de un usuario por su índice
  getUserInfo(index: number): any {
    return this.usersInfo[index];
  }
}
