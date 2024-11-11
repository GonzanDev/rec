import { Component, OnInit, inject } from '@angular/core';
import { UserStateService } from '../auth/data-access/user-state.service'; // Importa el servicio de estado global
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  userId: string = '';
  private authState = inject(AuthStateService);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Obtén el parámetro 'userId' de la ruta
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('userId')!;
      console.log('User ID:', this.userId);
      // Aquí puedes hacer algo con el userId, como cargar los detalles del usuario
    });
  }

  async logOut() {
    await this.authState.logOut();
    this.router.navigateByUrl('/auth/sign-in');
  }
}
