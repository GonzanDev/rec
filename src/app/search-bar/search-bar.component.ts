import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotifyService } from '../services/spotify.service';
import { Router, RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
})
export class SearchBarComponent {
  searchTerm: string = '';
  searchResults: any = {
    tracks: [],
    albums: [],
    artists: [],
  };
  showResults: boolean = false;
  @ViewChild('resultsBox') resultsBox!: ElementRef;

  constructor(
    private spotifyService: SpotifyService,
    private router: Router,
    private elRef: ElementRef
  ) {}

  onSearch() {
    if (this.searchTerm.trim()) {
      this.spotifyService.search(this.searchTerm).subscribe(
        (response) => {
          this.searchResults.tracks = response.tracks.items;
          this.searchResults.albums = response.albums.items;
          this.searchResults.artists = response.artists.items;
          // Only show results if any of the categories have items
          this.showResults =
            this.searchResults.tracks.length > 0 ||
            this.searchResults.albums.length > 0 ||
            this.searchResults.artists.length > 0;
        },
        (error) => {
          console.error(error);
          this.showResults = false;
        }
      );
    } else {
      this.showResults = false;
    }
  }

  viewSongDetails(songId: string) {
    this.router.navigate([`/song`, songId]);
    this.showResults = false; // Close results on navigation
  }

  viewAlbumDetails(albumId: string) {
    this.router.navigate([`/album`, albumId]);
    this.showResults = false; // Close results on navigation
  }

  viewArtistDetails(artistId: string) {
    this.router.navigate([`/artist`, artistId]);
    this.showResults = false; // Close results on navigation
  }

  goHome() {
    this.router.navigate([`/home`]);
  }

  // Detect click outside the results to close it
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.resultsBox &&
      this.showResults &&
      !this.elRef.nativeElement.contains(event.target)
    ) {
      this.showResults = false;
    }
  }
}
