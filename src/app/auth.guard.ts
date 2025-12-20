import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStateService } from "./components/auth/data-access/auth-state.service";
import { map } from "rxjs";

export const privateGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);

    return authState.authStateReady$.pipe(
      map(user => {
        if (!user) {
          router.navigateByUrl('/auth/sign-in');
          return false;
        }
        return true;
      })
    );
  };
};

export const publicGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);

    return authState.authStateReady$.pipe(
      map(user => {
        if (user) {
          router.navigateByUrl('home');
          return false;
        }
        return true;
      })
    );
  };
};
