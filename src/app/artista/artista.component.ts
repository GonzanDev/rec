import { NgFor, NgIf } from '@angular/common';
import { SpotifyService } from './../services/spotify.service';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { AlbumListComponent } from '../album-list/album-list.component';

@Component({
  selector: 'app-artista',
  standalone: true,
  imports: [NgIf, NgFor, AlbumListComponent],
  templateUrl: './artista.component.html',
  styleUrls: ['./artista.component.css']
})
export class ArtistaComponent {
  artist: any;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const artistId = params.get('artistId');
          if (artistId) {
            return this.spotifyService.getArtistDetails(artistId); // Asegúrate de tener este método en el servicio
          }
          return [];
        })
      )
      .subscribe(
        (data) => {
          this.artist = data;
        },
        (error) => {
          console.error('Error fetching artist details:', error);
        }
      );
  }
}
