import { inject, Injectable } from '@angular/core';
import { Firestore, collection, docData, doc } from '@angular/fire/firestore';
import { arrayRemove, arrayUnion, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

  async getById(userId: string): Promise<User | null> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const docSnapshot = await getDoc(userDocRef);
    if (docSnapshot.exists()) {
      return docSnapshot.data() as User;
    }
    return null;
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
    console.log("User: ", userId, " Artist: ", artistId);
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

  addFollower(userId: string, followerId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const followerDocRef = doc(this.firestore, `users/${followerId}`);

    return updateDoc(userDocRef, {
      followers: arrayUnion(followerId),  // Agregar el 'followerId' a la lista de seguidores del usuario
    }).then(() => {
      return updateDoc(followerDocRef, {
        following: arrayUnion(userId),  // Agregar el 'userId' a la lista de 'following' del seguidor
      });
    });
  }

  removeFollower(userId: string, followerId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const followerDocRef = doc(this.firestore, `users/${followerId}`);

    return updateDoc(userDocRef, {
      followers: arrayRemove(followerId),  // Eliminar el 'followerId' de la lista de seguidores del usuario
    }).then(() => {
      return updateDoc(followerDocRef, {
        following: arrayRemove(userId),  // Eliminar el 'userId' de la lista de 'following' del seguidor
      });
    });
  }

  isFollowing(currentUserId: string, userId: string): Observable<boolean> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return new Observable<boolean>((observer) => {
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const followers = userData?.['followers'] || [];
          observer.next(followers.includes(currentUserId)); // Si el currentUserId está en followers, devuelve true
        } else {
          observer.next(false);
        }
        observer.complete();
      }).catch((error) => {
        console.error('Error al verificar el seguimiento:', error);
        observer.next(false);
        observer.complete();
      });
    });
  }
}
