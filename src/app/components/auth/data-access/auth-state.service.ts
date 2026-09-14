import { inject, Injectable } from '@angular/core';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { UserStateService } from './user-state.service';
import { UserService } from '../../../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private _auth = inject(Auth);
  private userStateService = inject(UserStateService);
  private userService = inject(UserService);

  get authState$(): Observable<any> {
    return authState(this._auth);
  }

  get authStateReady$(): Observable<any> {
    return new Observable(subscriber => {
      const unsubscribe = this._auth.onAuthStateChanged(user => {
        subscriber.next(user);
        subscriber.complete();
      });
      return unsubscribe;
    });
  }

  getUser(): Observable<any> {
    return authState(this._auth);
  }

  logOut() {
    return signOut(this._auth).then(() => {
      this.userStateService.clearUserId();
    });
  }

  initAuthStateListener() {
    this.authState$.subscribe((user) => {
      if (user) {
        this.userStateService.setUserId(user.uid);
        this.userService.removeLegacyPassword(user.uid);
      } else {
        this.userStateService.clearUserId();
      }
    });
  }
}
