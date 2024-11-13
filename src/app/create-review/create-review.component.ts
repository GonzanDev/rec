import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../services/review.service';
import { Auth } from '@angular/fire/auth'; // Importa Auth de Firebase
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-create-review',
  standalone: true,
  templateUrl: './create-review.component.html',
  styleUrls: ['./create-review.component.css'],
  imports: [CommonModule, FormsModule],
})
export class CreateReviewComponent {
  albums: any[] = [];
  @Input() selectedAlbum: any;
  @Output() close = new EventEmitter<void>();
  timestamp = Timestamp.now;
  comment: string = '';
  rating: number = 0;
  userId: string = ''; // Variable local para almacenar userId

  constructor(
    private spotifyService: SpotifyService,
    private reviewService: ReviewService,
    private auth: Auth // Inyecta Auth para obtener userId
  ) {}

  async ngOnInit() {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.userId = currentUser.uid; // Asigna el userId del usuario autenticado
    }
  }

  closeReview() {
    this.close.emit();
  }

  async submitReview() {
    if (!this.userId) {
      console.error('Error: no se encontró el ID del usuario');
      return;
    }

    const newReview: Review = {
      albumId: this.selectedAlbum.id,
      userId: this.userId,
      comment: this.comment,
      rating: this.rating,
      timestamp: this.timestamp(),
    };

    try {
      await this.reviewService.create(newReview);
      this.comment = '';
      this.rating = 0;
      this.closeReview();
    } catch (error) {
      console.error('Error al crear la reseña:', error);
    }
  }

  setRating(star: number) {
    this.rating = star;
  }
}
