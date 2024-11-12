import { inject, Injectable } from '@angular/core';
import { Firestore, collection, docData, doc } from '@angular/fire/firestore';
import { arrayRemove, arrayUnion, setDoc, updateDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface User {
  id?: string;
  email: string;
  password: string;
  username?: string;
  reviews?: string[];
  favoriteAlbums?: string[];
  favoriteArtists?: string[];
  followers?: string[];
  following?: string[];
}

const PATH = 'users';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private users = collection(this.firestore, PATH);

  create(user: User) {
    const userDocRef = doc(this.firestore, `users/${user.id}`);
    return setDoc(userDocRef, user);
  }

  getUserProfile(userId: string): Observable<any> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return docData(userDocRef);
  }

  addFavoriteAlbum(userId: string, albumId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userDocRef, {
      favoriteAlbums: arrayUnion(albumId),
    });
  }

  removeFavoriteAlbum(userId: string, albumId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userDocRef, {
      favoriteAlbums: arrayRemove(albumId),
    });
  }

  addFavoriteArtist(userId: string, artistId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userDocRef, {
      favoriteArtists: arrayUnion(artistId),
    });
  }

  removeFavoriteArtist(userId: string, artistId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userDocRef, {
      favoriteArtists: arrayRemove(artistId),
    });
  }
}
