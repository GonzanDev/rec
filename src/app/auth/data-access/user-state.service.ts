import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private userIdSubject = new BehaviorSubject<string | null>(null); // Inicialmente null

  get userId$() {
    return this.userIdSubject.asObservable();
  }

  // Establece la ID del usuario
  setUserId(userId: string) {
    this.userIdSubject.next(userId); // Actualiza la ID en el comportamiento
  }

  // Limpiar la ID del usuario
  clearUserId() {
    this.userIdSubject.next(null); // Limpia la ID
  }
}
