import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: '<p>Procesando inicio de sesión...</p>',
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService, // Inyectamos AuthService
    @Inject(PLATFORM_ID) private platformId: any // Injectamos PLATFORM_ID
  ) {}

  ngOnInit(): void {
    // Solo ejecutamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Suscripción a los parámetros de la URL
      this.route.queryParams.subscribe((params) => {
        const code = params['code'];
        console.log('Código recibido:', code); // Verifica si el código es correcto

        if (code) {
          // Intercambiamos el código por el token
          this.authService.exchangeCodeForToken(code).subscribe(
            (response) => {
              console.log('Token obtenido:', response); // Verifica la respuesta

              // Guardamos el token en localStorage
              if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem(
                  'spotify_access_token',
                  response.access_token
                );

                if (response.refresh_token) {
                  localStorage.setItem(
                    'spotify_refresh_token',
                    response.refresh_token
                  );
                }

                // Guardamos el tiempo de expiración del token, si se ha proporcionado
                if (response.expires_in) {
                  const expirationTime =
                    new Date().getTime() + response.expires_in * 1000;
                  localStorage.setItem(
                    'spotify_token_expiration',
                    expirationTime.toString()
                  );
                }

                // Redirigimos al usuario a la página deseada, o a /home
                const redirectUrl =
                  localStorage.getItem('redirectUrl') || '/home';
                window.location.href = redirectUrl;
              }
            },
            (error) => {
              console.error('Error al obtener el token de acceso', error);
              // Si hay un error, redirigir al login o a otra página adecuada
              window.location.href = '/login';
            }
          );
        } else {
          console.error('No se recibió el código');
          // Redirigir al login si no se recibe el código
          window.location.href = '/login';
        }
      });
    }
  }
}
