// callback.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: '<p>Procesando inicio de sesión...</p>',
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService // Inyectamos AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];

      if (code) {
        this.authService.exchangeCodeForToken(code).subscribe((response) => {
          localStorage.setItem('spotify_access_token', response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('spotify_refresh_token', response.refresh_token);
          }
          
          window.location.href = '/';
        }, error => {
          console.error('Error al obtener el token de acceso', error);
        });
      }
    });
  }
}
