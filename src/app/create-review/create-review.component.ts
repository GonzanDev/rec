import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  @Input() albumName: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() reviewCreated = new EventEmitter<any>(); // Emitir la reseña creada
  reviewText: string = '';
  rating: number = 0;

  constructor(private spotifyService: SpotifyService) {}

  // Método para cerrar el componente de reseña
  closeReview() {
    this.close.emit();
  }

  // Método para enviar la reseña
  submitReview() {
    const newReview = {
      albumName: this.albumName,
      artistName: this.selectedAlbum.artists[0].name,
      reviewText: this.reviewText,
      rating: this.rating,
    };
    this.reviewCreated.emit(newReview); // Emitir la reseña
    this.reviewText = '';
    this.rating = 0;
    this.closeReview();
  }

  // Método para establecer la calificación
  setRating(star: number) {
    this.rating = star;
  }
}
