import { inject, Injectable } from '@angular/core';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { UserStateService } from './user-state.service'; // Importa el servicio de estado global

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private _auth = inject(Auth);
  private userStateService = inject(UserStateService); // Inyecta el servicio global de usuario

  // Stream observable del estado de autenticación
  get authState$(): Observable<any> {
    return authState(this._auth);
  }

  // Recupera el usuario actualmente autenticado (si existe)
  getUser(): Observable<any> {
    return authState(this._auth); // Ya no es necesario duplicarlo, ambos retornan lo mismo
  }

  // Log out el usuario
  logOut() {
    return signOut(this._auth).then(() => {
      console.log('Usuario cerrado sesión');
      this.userStateService.clearUserId(); // Limpiar la ID cuando el usuario cierre sesión
    });
  }

  // Guarda el ID del usuario cuando se autentica
  storeUserId() {
    const user = this._auth.currentUser;
    if (user) {
      this.userStateService.setUserId(user.uid);
    }
  }


  initAuthStateListener() {
    this.authState$.subscribe((user) => {
      if (user) {
        this.userStateService.setUserId(user.uid); // Guarda el ID del usuario cuando se autentica
      } else {
        this.userStateService.clearUserId(); // Elimina la ID cuando el usuario cierra sesión
      }
    });
  }
}

