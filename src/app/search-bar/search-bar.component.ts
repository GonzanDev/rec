import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotifyService } from '../services/spotify.service';
import {
  Router,
  RouterModule,
  RouterLink,
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
    RouterLink,
  ],
})
export class SearchBarComponent {
  searchTerm: string = '';
  searchResults: any = {
    tracks: [],
    albums: [],
    artists: [],
  }; // Cambie el array simple a un objeto con tracks, albums y artists

  constructor(private spotifyService: SpotifyService, private router: Router) {}

  onSearch() {
    if (this.searchTerm.trim()) {
      this.spotifyService.search(this.searchTerm).subscribe(
        (response) => {
          this.searchResults.tracks = response.tracks.items;
          this.searchResults.albums = response.albums.items;
          this.searchResults.artists = response.artists.items;
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }

  viewSongDetails(songId: string) {
    this.router.navigate([`/song`, songId]);
  }

  viewAlbumDetails(albumId: string) {
    this.router.navigate([`/album`, albumId]);
  }

  viewArtistDetails(artistId: string) {
    this.router.navigate([`/artist`, artistId]);
  }
}
