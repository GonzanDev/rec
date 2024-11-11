import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, docData } from '@angular/fire/firestore';
import { addDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface User {
  id?: string;
  email: string;
  password: string;
  username?: string;
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
    return addDoc(this.users, user);
  }

  // Método para obtener el perfil del usuario a partir del ID
  getUserProfile(userId: string): Observable<User | undefined> {
    const userDocRef = doc(this.firestore, `${PATH}/${userId}`);
    return docData(userDocRef, { idField: 'id' }) as Observable<
      User | undefined
    >;
  }
}
