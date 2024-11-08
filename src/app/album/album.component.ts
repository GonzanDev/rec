import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import { switchMap } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-album',
  imports: [NgIf],
  templateUrl: `./album.component.html`,
  styleUrl: `./album.component.css`,
})
export class AlbumComponent implements OnInit {
  album: any;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        // `switchMap` cambia la solicitud a una nueva cada vez que cambia el parámetro `albumId`
        switchMap((params) => {
          const albumId = params.get('albumId');
          if (albumId) {
            return this.spotifyService.getAlbumDetails(albumId);
          }
          return [];
        })
      )
      .subscribe(
        (data) => {
          this.album = data;
        },
        (error) => {
          console.error('Error fetching album details:', error);
        }
      );
  }
}
