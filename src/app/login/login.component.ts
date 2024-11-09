import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [], // Añade aquí módulos necesarios si el componente es standalone
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  loginWithSpotify(): void {
    this.authService.redirectToSpotifyLogin();
    this.router.navigate(['/home']);
  }
}
