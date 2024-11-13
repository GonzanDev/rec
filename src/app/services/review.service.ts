import { inject, Injectable } from '@angular/core';
import { Firestore, collection, docData, doc, setDoc, updateDoc, arrayUnion, arrayRemove, collectionData } from '@angular/fire/firestore';
import { addDoc, deleteDoc, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface Review {
  id?: string;
  albumId: string;
  userId: string;
  rating: number;
  comment: string;
  timestamp: Timestamp;
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
    // Crear una consulta para filtrar por `albumId` y ordenar por `timestamp`
    const albumReviewsQuery = query(
      this.reviews,
      where('albumId', '==', albumId),
      orderBy('timestamp', 'desc')
    );

    // Usar `collectionData` para obtener los documentos y transformarlos en observables
    return collectionData(albumReviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }


  getAllReviews(): Observable<Review[]> {
    const reviewsQuery = query(
      this.reviews,
      orderBy('timestamp', 'desc')  // Ordenar las reseñas por la fecha de creación
    );

    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }

  getUserById(userId: string): Observable<any> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return docData(userDocRef);  // Devuelve un observable del usuario
  }

  // Método para obtener el álbum por ID
  getAlbumById(albumId: string): Observable<any> {
    const albumDocRef = doc(this.firestore, `album/${albumId}`);
    return docData(albumDocRef);  // Devuelve un observable del álbum
  }


  // Obtener una reseña por su ID
  getReviewById(reviewId: string): Observable<Review> {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    return docData(reviewDocRef);
  }

  // Actualizar una reseña (por ejemplo, para editarla)
  updateReview(reviewId: string, updatedReview: Partial<Review>) {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    return updateDoc(reviewDocRef, updatedReview);
  }

  // Eliminar una reseña (por ejemplo, cuando el usuario elimina su reseña)
  deleteReview(reviewId: string) {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    return deleteDoc(reviewDocRef);
  }

  // Agregar una reseña a los favoritos de un usuario (si es necesario)
  addFavoriteReview(userId: string, reviewId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userDocRef, {
      favoriteReviews: arrayUnion(reviewId),
    });
  }

  // Eliminar una reseña de los favoritos de un usuario (si es necesario)
  removeFavoriteReview(userId: string, reviewId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userDocRef, {
      favoriteReviews: arrayRemove(reviewId),
    });
  }
}
