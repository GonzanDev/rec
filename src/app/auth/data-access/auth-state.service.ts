import { inject, Injectable } from '@angular/core';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private _auth = inject(Auth);
  private userStateService = inject(UserStateService);

  get authState$(): Observable<any> {
    return authState(this._auth);
  }

  getUser(): Observable<any> {
    return authState(this._auth);
  }

  logOut() {
    return signOut(this._auth).then(() => {
      console.log('Usuario cerrado sesión');
      this.userStateService.clearUserId(); // Limpiar ID al cerrar sesión
    });
  }

  initAuthStateListener() {
    this.authState$.subscribe((user) => {
      if (user) {
        this.userStateService.setUserId(user.uid); // Guarda ID al autenticar
      } else {
        this.userStateService.clearUserId(); // Elimina ID al cerrar sesión
      }
    });
  }
}
