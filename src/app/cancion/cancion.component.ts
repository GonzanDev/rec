import { NgFor, NgIf } from '@angular/common';
import { SpotifyService } from './../services/spotify.service';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-cancion',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './cancion.component.html',
  styleUrls: ['./cancion.component.css']
})
export class CancionComponent {
  song: any;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const songId = params.get('songId'); // Cambiado de albumId a songId
          if (songId) {
            return this.spotifyService.getSongDetails(songId); // Asegúrate de tener este método en el servicio
          }
          return [];
        })
      )
      .subscribe(
        (data) => {
          this.song = data;
        },
        (error) => {
          console.error('Error fetching song details:', error);
        }
      );
  }
}
