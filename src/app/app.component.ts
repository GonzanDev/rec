import { Component } from '@angular/core';
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
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    FormsModule, // Add FormsModule here
    ArtistaComponent,
    SearchBarComponent,
  ],
  standalone: true,
})
export class AppComponent {
  title = 'barra-busqueda';

  searchResults: any[] = [];

  constructor(private spotifyService: SpotifyService) {}

  onSearch(query: string) {
    this.spotifyService.search(query).subscribe(
      (response) => {
        this.searchResults = response.tracks.items;
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
