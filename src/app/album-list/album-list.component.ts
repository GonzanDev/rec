import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-album-list',
  imports: [NgFor],
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.css'],
})
export class AlbumListComponent implements OnInit {
  @Input() artistId?: string; // Permite pasar un artistId como parámetro
  albums: any[] = [];
  @ViewChild('carousel') carousel!: ElementRef;

  constructor(private spotifyService: SpotifyService, private router: Router) {}

  ngOnInit() {
    if (this.artistId) {
      // Si hay un artistId, buscamos los álbumes de ese artista
      this.spotifyService.getAlbumsByArtist(this.artistId).subscribe(
        (albums) => {
          this.albums = albums;
        },
        (error) => {
          console.error('Error fetching albums:', error);
        }
      );
    } else {
      this.spotifyService.getTopAlbums().subscribe(
        (albums) => {
          this.albums = albums;
        },
        (error) => {
          console.error('Error fetching albums:', error);
        }
      );
    }
  }

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  viewAlbumDetails(albumId: string) {
    this.router.navigate([`/album`, albumId]); // Navega a la ruta del detalle del álbum
  }

  loadAlbums() {
    if (this.artistId) {
      this.spotifyService.getAlbumsByArtist(this.artistId).subscribe({
        next: (albums) => {
          this.albums = albums;
        },
        error: (error) => {
          console.error('Error loading albums:', error);
        },
      });
    }
  }
}
