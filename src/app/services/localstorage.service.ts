import { inject, Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { signOut } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private _auth = inject(Auth);

  get authState$(): Observable<any> {
    return authState(this._auth);
  }

  getUser(): Observable<any> {
    return authState(this._auth);
  }

  logOut() {
    return signOut(this._auth).then(() => {
      console.log('Usuario cerrado sesión');
      localStorage.removeItem('userId');  // Elimina la ID cuando el usuario cierre sesión
    });
  }

  // Almacenar la ID en localStorage cuando el usuario inicie sesión
  storeUserId() {
    const user = this._auth.currentUser;
    if (user) {
      localStorage.setItem('userId', user.uid);  // Guarda la ID en localStorage
    }
  }

  // Recuperar la ID desde localStorage
  getUserIdFromStorage(): string | null {
    return localStorage.getItem('userId');
  }
}
/*import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
  }
}*/
