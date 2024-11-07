import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { SpotifyService } from '../services/spotify.service';
import {
  RouterOutlet,
  RouterModule,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ], // Add FormsModule here
})
export class SearchBarComponent {
  searchTerm: string = '';
  searchResults: any[] = []; // Initialize searchResults as an empty array

  constructor(private spotifyService: SpotifyService) {}

  onSearch() {
    if (this.searchTerm.trim()) {
      this.spotifyService.search(this.searchTerm).subscribe(
        (response) => {
          this.searchResults = response.tracks.items;
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }
}
