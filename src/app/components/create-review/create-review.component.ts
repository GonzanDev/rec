import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../services/review.service';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'ngx-sonner';

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
  @Output() reviewCreated = new EventEmitter<Review>();

  comment: string = '';
  rating: number = 0;
  hoverRating: number = 0;
  userId: string = '';
  isSubmitting: boolean = false;

  constructor(
    private spotifyService: SpotifyService,
    private reviewService: ReviewService,
    private auth: Auth
  ) {}

  async ngOnInit() {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.userId = currentUser.uid;
    }
  }

  setRating(star: number) {
    this.rating = star;
  }

  getRatingText(): string {
    const texts = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];
    return texts[this.rating] || '';
  }

  closeReview() {
    this.close.emit();
  }

  async submitReview() {
    if (!this.userId) {
      console.error('Error: no se encontró el ID del usuario');
      toast.error('Debes iniciar sesión');
      return;
    }

    if (!this.comment.trim()) {
      toast.error('Escribe un comentario');
      return;
    }

    if (this.rating === 0) {
      toast.error('Selecciona una calificación');
      return;
    }

    this.isSubmitting = true;

    const newReview: Review = {
      albumId: this.selectedAlbum.id,
      userId: this.userId,
      comment: this.comment,
      rating: this.rating,
      timestamp: Timestamp.now(),
      likes: [],
      comments: []
    };

    try {
      const docRef = await this.reviewService.create(newReview);
      newReview.id = docRef.id;

      this.reviewCreated.emit(newReview);
      toast.success('Reseña publicada');

      this.comment = '';
      this.rating = 0;
      this.closeReview();
    } catch (error) {
      console.error('Error al crear la reseña:', error);
      toast.error('Error al crear la reseña');
    } finally {
      this.isSubmitting = false;
    }
  }
}
