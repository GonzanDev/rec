import { Component } from '@angular/core';
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
  selectedAlbum: any;
  reviewText: string = '';
  rating: number = 0; // Para manejar la calificación
  reviews: any[] = []; // Array para almacenar las reseñas

  constructor(private spotifyService: SpotifyService) {}

  onSearch(event: any) {
    const query = event.target.value;

    this.spotifyService.search(query).subscribe((response: any) => {
      this.albums = response.albums.items;
    });
  }

  selectAlbum(album: any) {
    this.spotifyService.getAlbumDetails(album.id).subscribe((details: any) => {
      this.selectedAlbum = details;
    });
  }

  submitReview() {
    if (this.selectedAlbum && this.reviewText && this.rating > 0) {
      const review = {
        albumId: this.selectedAlbum.id,
        albumName: this.selectedAlbum.name,
        artistName: this.selectedAlbum.artists[0].name,
        reviewText: this.reviewText,
        rating: this.rating, // Agregar calificación
      };
      this.reviews.push(review); // Agregar la reseña al array
      console.log('Reseña creada:', review);
      
      // Resetear campos después de enviar la reseña
      this.reviewText = '';
      this.selectedAlbum = null;
      this.rating = 0;
    } else {
      console.warn('Selecciona un álbum, escribe una reseña y da una calificación antes de enviar.');
    }
  }
}
