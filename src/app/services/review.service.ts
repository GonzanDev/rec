import { inject, Injectable } from '@angular/core';
import { Firestore, collection, docData, doc, setDoc, updateDoc, arrayUnion, arrayRemove, collectionData } from '@angular/fire/firestore';
import { addDoc, deleteDoc, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface Review {
  id?: string;
  albumId: string;
  userId: string;
  rating: number;
  comment: string;
  timestamp: Timestamp;
  likes?: string[];
  comments?: { userId: string; content: string; timestamp: Date }[];  // Nuevo campo para los comentarios
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
    return addDoc(this.reviews, review);
  }

  getReviewsByUser(userId: string): Promise<Review[]> {
  const reviewsCollection = collection(this.firestore, 'reviews');
  const q = query(reviewsCollection, where('userId', '==', userId));
  return getDocs(q).then(snapshot => {
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,  // Include the document ID
      ...doc.data()
    })) as Review[];
    return reviews;
  });
}

  getReviewsByAlbum(albumId: string): Observable<Review[]> {
  const reviewsCollection = collection(this.firestore, 'reviews');
  const q = query(reviewsCollection, where('albumId', '==', albumId), orderBy('timestamp', 'desc'));
  return collectionData(q, { idField: 'id' }) as Observable<Review[]>;
}

  getAllReviews(): Observable<Review[]> {
  return collectionData(this.reviews, { idField: 'id' }) as Observable<Review[]>;
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

  addLike(reviewId: string, userId: string) {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    return updateDoc(reviewDocRef, {
      likes: arrayUnion(userId)
    });
  }

  removeLike(reviewId: string, userId: string) {
    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    return updateDoc(reviewDocRef, {
      likes: arrayRemove(userId)
    });
  }

  // Nuevo método para agregar un comentario a una reseña
  addComment(reviewId: string, userId: string, content: string) {
    const comment = {
      userId,
      content,
      timestamp: new Date(),
    };

    const reviewDocRef = doc(this.firestore, `reviews/${reviewId}`);
    return updateDoc(reviewDocRef, {
      comments: arrayUnion(comment)  // Agregar el comentario al array de "comments"
    });
  }


}
