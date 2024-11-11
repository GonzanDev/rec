import { Component } from '@angular/core';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { ProfileComponent } from '../../profile/profile.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [SearchBarComponent, ProfileComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
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
