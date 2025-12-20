import { inject, Injectable,  } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, UserCredential } from "@angular/fire/auth";
import { UserService, User } from "./user.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private userService = inject(UserService);


  async signUp(user: User): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this._auth, user.email, user.password);

      await this.userService.create({
        id: userCredential.user.uid,
        email: user.email,
        password: user.password,
        username: user.username,
        favoriteAlbums: user.favoriteAlbums || [],
        favoriteArtists: user.favoriteArtists || [],
        reviews: user.reviews || [],
        followers: user.followers || [],
        following: user.following || [],
      });

      return userCredential;
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      throw error;
    }
  }

  signIn(user: User) {
    return signInWithEmailAndPassword(this._auth, user.email, user.password);
  }

  async signInWithGoogle(): Promise<UserCredential> {

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(this._auth, provider);
    console.log('Google sign in result:', result.user?.uid);

    // Check if user exists in Firestore, if not create them
    try {
      const existingUser = await this.userService.getById(result.user.uid);
      if (!existingUser) {
        await this.userService.create({
          id: result.user.uid,
          email: result.user.email || '',
          password: '', // No password for Google users
          username: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          favoriteAlbums: [],
          favoriteArtists: [],
          reviews: [],
          followers: [],
          following: [],
        });
        console.log('Created new user in Firestore for Google sign-in');
      }
    } catch (error) {
      console.error('Error checking/creating user in Firestore:', error);
    }

    return result;
  }
}
