import { Component, OnInit } from '@angular/core';
import { UserStateService } from '../auth/data-access/user-state.service';  // Importa el servicio de estado global
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  userId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Obtén el parámetro 'userId' de la ruta
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('userId')!;
      console.log('User ID:', this.userId);
      // Aquí puedes hacer algo con el userId, como cargar los detalles del usuario
    });
  }
}

