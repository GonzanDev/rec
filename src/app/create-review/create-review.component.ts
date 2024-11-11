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
  @Input() albumName: string = ''; // Add an input property for the album name
  @Output() close = new EventEmitter<void>(); // Add an output event for closing the component
  reviewText: string = '';
  rating: number = 0;
  reviews: any[] = [];

  constructor(private spotifyService: SpotifyService) {}

  onSearch(event: any) {
    const query = event.target.value;

    this.spotifyService.search(query).subscribe((response: any) => {
      this.albums = response.albums.items;
    });
  }

  // Seleccionar álbum para reseña
  selectAlbum(album: any) {
    this.spotifyService.getAlbumDetails(album.id).subscribe((details: any) => {
      this.selectedAlbum = details;
    });
  }

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
    this.reviews.push(newReview);
    this.reviewText = '';
    this.rating = 0;
    this.closeReview();
  }

  // Método para establecer la calificación
  setRating(star: number) {
    this.rating = star;
  }
}
