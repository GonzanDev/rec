import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterModule,
  RouterLink,
  RouterLinkActive,

} from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ArtistaComponent } from './artista/artista.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SpotifyService } from './services/spotify.service';
import { AlbumListComponent } from './album-list/album-list.component';

import {toast, NgxSonnerToaster} from 'ngx-sonner';
import { AuthStateService } from './auth/data-access/auth-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    FormsModule, // Add FormsModule here
    ArtistaComponent,
    SearchBarComponent,
    AlbumListComponent,
    NgxSonnerToaster
  ],
  standalone: true,
})
export class AppComponent {
  title = 'barra-busqueda';
  private router = inject(Router);

  private authState = inject(AuthStateService);
  async logOut(){
    await this.authState.logOut();
    this.router.navigateByUrl('/auth/sign-in');
  }

}
