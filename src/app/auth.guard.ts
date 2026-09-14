import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStateService } from "./components/auth/data-access/auth-state.service";
import { UserService } from "./services/user.service";
import { map, switchMap, of } from "rxjs";

export const privateGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);
    const userService = inject(UserService);

    return authState.authStateReady$.pipe(
      switchMap(user => {
        if (!user) {
          router.navigateByUrl('/auth/sign-in');
          return of(false);
        }
        // Admin accounts are confined to the admin panel — they never see
        // the regular app.
        return userService.isAdmin(user.uid).pipe(
          map(isAdmin => {
            if (isAdmin) {
              router.navigateByUrl('/admin');
              return false;
            }
            return true;
          })
        );
      })
    );
  };
};

export const adminGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);
    const userService = inject(UserService);

    return authState.authStateReady$.pipe(
      switchMap(user => {
        if (!user) {
          router.navigateByUrl('/auth/sign-in');
          return of(false);
        }
        return userService.isAdmin(user.uid).pipe(
          map(isAdmin => {
            if (!isAdmin) {
              router.navigateByUrl('/home');
              return false;
            }
            return true;
          })
        );
      })
    );
  };
};

export const publicGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);
    const userService = inject(UserService);

    return authState.authStateReady$.pipe(
      switchMap(user => {
        if (!user) {
          return of(true);
        }
        return userService.isAdmin(user.uid).pipe(
          map(isAdmin => {
            router.navigateByUrl(isAdmin ? '/admin' : '/home');
            return false;
          })
        );
      })
    );
  };
};
