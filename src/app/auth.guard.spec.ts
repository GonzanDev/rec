import { TestBed } from '@angular/core/testing';
import {
  Router,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './services/auth.service';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Mock de AuthService
class MockAuthService {
  isLoggedIn() {
    return true; // Simula que el usuario está logueado.
  }
}

// Mock de Router
class MockRouter {
  navigate(path: string[]) {
    // Simula la navegación
    return path;
  }
}

describe('AuthGuard', () => {
  let authService: AuthService;
  let authGuard: AuthGuard;
  let router: Router;

  const mockPlatformId = isPlatformBrowser('browser') ? 'browser' : 'server';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useClass: MockAuthService }, // Proveemos el mock de AuthService
        { provide: Router, useClass: MockRouter }, // Proveemos el mock de Router
        { provide: PLATFORM_ID, useValue: mockPlatformId }, // Proveemos el mock de PLATFORM_ID
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    authGuard = TestBed.inject(AuthGuard); // Usamos inyección en lugar de instanciación manual
  });

  it('should allow access if user is logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(true); // Simula que el usuario está logueado

    const activatedRouteSnapshotMock = {} as ActivatedRouteSnapshot;
    const routerStateSnapshotMock = {} as RouterStateSnapshot;

    const result = authGuard.canActivate(
      activatedRouteSnapshotMock,
      routerStateSnapshotMock
    );

    expect(result).toBe(true); // El acceso debe ser permitido
  });

  it('should deny access if user is not logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(false); // Simula que el usuario NO está logueado

    const activatedRouteSnapshotMock = {} as ActivatedRouteSnapshot;
    const routerStateSnapshotMock = {} as RouterStateSnapshot;

    const result = authGuard.canActivate(
      activatedRouteSnapshotMock,
      routerStateSnapshotMock
    );

    expect(result).toBe(false); // El acceso debe ser denegado
  });

  it('should allow access in SSR (server-side rendering)', () => {
    // Simula un entorno de SSR (servidor)
    const mockPlatformIdSSR = 'server';
    TestBed.overrideProvider(PLATFORM_ID, { useValue: mockPlatformIdSSR });

    authGuard = TestBed.inject(AuthGuard); // Re-inyecta el guard con la nueva configuración del mock

    const activatedRouteSnapshotMock = {} as ActivatedRouteSnapshot;
    const routerStateSnapshotMock = {} as RouterStateSnapshot;

    const result = authGuard.canActivate(
      activatedRouteSnapshotMock,
      routerStateSnapshotMock
    );

    expect(result).toBe(true); // En SSR, siempre se debe permitir el acceso
  });
});
