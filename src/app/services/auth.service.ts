import { inject, Injectable,  } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, UserCredential } from "@angular/fire/auth";
import { UserService, User } from "./user.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private userService = inject(UserService);


  async signUp(credentials: { email: string; password: string; username?: string } & Partial<User>): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this._auth, credentials.email, credentials.password);

      await this.userService.create({
        id: userCredential.user.uid,
        email: credentials.email,
        username: credentials.username,
        favoriteAlbums: credentials.favoriteAlbums || [],
        favoriteArtists: credentials.favoriteArtists || [],
        reviews: credentials.reviews || [],
        followers: credentials.followers || [],
        following: credentials.following || [],
      });

      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  signIn(credentials: { email: string; password: string }) {
    return signInWithEmailAndPassword(this._auth, credentials.email, credentials.password);
  }

  async signInWithGoogle(): Promise<UserCredential> {

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(this._auth, provider);

    // Check if user exists in Firestore, if not create them
    try {
      const existingUser = await this.userService.getById(result.user.uid);
      if (!existingUser) {
        await this.userService.create({
          id: result.user.uid,
          email: result.user.email || '',
          username: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          favoriteAlbums: [],
          favoriteArtists: [],
          reviews: [],
          followers: [],
          following: [],
        });
      }
    } catch {
    }

    return result;
  }
}
