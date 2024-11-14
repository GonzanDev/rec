import { inject, Injectable } from '@angular/core';
import { Firestore, collection, docData, doc, setDoc, updateDoc, arrayUnion, arrayRemove, collectionData } from '@angular/fire/firestore';
import { addDoc, deleteDoc, getDoc, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface Review {
  id?: string;
  albumId: string;
  userId: string;
  rating: number;
  comment: string;
  timestamp: Timestamp;
  likes?: string[];
}

const PATH = 'reviews'; // Ruta de la colección de reseñas

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private firestore = inject(Firestore);
  private reviews = collection(this.firestore, PATH);

  // Crear una nueva reseña
  create(review: Review) {
    return addDoc(this.reviews, review); // Usa addDoc para dejar que Firestore genere el ID
  }

  getReviewsByAlbum(albumId: string): Observable<Review[]> {
    const albumReviewsQuery = query(
      this.reviews,
      where('albumId', '==', albumId),
      orderBy('timestamp', 'desc')
    );

    return collectionData(albumReviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }

  getAllReviews(): Observable<Review[]> {
    const reviewsQuery = query(
      this.reviews,
      orderBy('timestamp', 'desc')
    );

    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }

  getUserById(userId: string): Observable<any> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return docData(userDocRef);
  }

  getReviewById(reviewId: string): Observable<Review> {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    return docData(reviewDocRef);
  }

  updateReview(reviewId: string, updatedReview: Partial<Review>) {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    return updateDoc(reviewDocRef, updatedReview);
  }

  deleteReview(reviewId: string) {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    return deleteDoc(reviewDocRef);
  }

  addFavoriteReview(userId: string, reviewId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userDocRef, {
      favoriteReviews: arrayUnion(reviewId),
    });
  }

  removeFavoriteReview(userId: string, reviewId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userDocRef, {
      favoriteReviews: arrayRemove(reviewId),
    });
  }

  async addLike(reviewId: string, userId: string) {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    const reviewDoc = await getDoc(reviewDocRef);

    if (reviewDoc.exists()) {
      return updateDoc(reviewDocRef, {
        likes: arrayUnion(userId)  // Agregar el ID del usuario a la lista de "likes"
      });
    } else {
      throw new Error('La reseña no existe.');
    }
  }

  // Quitar "like" de una reseña
  async removeLike(reviewId: string, userId: string) {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    const reviewDoc = await getDoc(reviewDocRef);

    if (reviewDoc.exists()) {
      return updateDoc(reviewDocRef, {
        likes: arrayRemove(userId)  // Eliminar el ID del usuario de la lista de "likes"
      });
    } else {
      throw new Error('La reseña no existe.');
    }
  }
}
