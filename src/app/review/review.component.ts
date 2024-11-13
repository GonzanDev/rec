import { Component, Input, OnInit } from '@angular/core';
import { ReviewService, Review } from '../services/review.service';
import { AuthService } from '../services/auth.service'; // Para obtener el usuario autenticado
import { Observable } from 'rxjs';
import { AuthStateService } from '../services/localstorage.service';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  @Input() albumId: string = ''; // Para saber qué álbum mostrar reseñas
  reviews$: Observable<Review[]> = new Observable();
  userId: string = ''; // ID del usuario autenticado
  rating: number = 0;
  comment: string = '';

  constructor(private reviewService: ReviewService, private authStateService: AuthStateService) {}

  ngOnInit(): void {
    // Obtener el usuario autenticado
    this.authStateService.getUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
    });

    // Obtener reseñas del álbum
    this.loadReviews();
  }

  loadReviews() {
    if (this.albumId) {
      this.reviews$ = this.reviewService.getReviewsByAlbum(this.albumId);
    }
  }

  addReview() {
    if (this.comment && this.rating > 0) {
      const newReview: Review = {
        albumId: this.albumId,
        userId: this.userId,
        rating: this.rating,
        comment: this.comment,
        timestamp: Timestamp.now(),
      };


      this.reviewService.create(newReview).then(() => {
        this.comment = '';
        this.rating = 0;
        this.loadReviews();
      }).catch((error) => {
        console.error('Error adding review:', error);
      });
    }
  }
}
