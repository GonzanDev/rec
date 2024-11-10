import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStateService } from "./auth/data-access/auth-state.service";
import { map } from "rxjs";

export const privateGuard = (): CanActivateFn  => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);

    return authState.authState$.pipe(
      map(state => {
        console.log(state);
        if(!state){
          router.navigateByUrl('/auth/sign-in');
          return false;
        }
        return true;
      })
    );
  };
};

export const publicGuard = (): CanActivateFn =>{
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);

    return authState.authState$.pipe(
      map(state => {
        if(state){
          router.navigateByUrl('home');
          return false;
        }
        return true;
      })
    );
  };
};


/*import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Llamar al método isLoggedIn() para verificar si el usuario está autenticado.
    if (this.authService.isLoggedIn()) {
      return true; // El usuario está autenticado, se permite el acceso a la ruta
    }

    // Si no está autenticado, redirigir al login
    this.router.navigate(['/login']);
    return false;
  }
}
*/
