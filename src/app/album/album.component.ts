import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import { switchMap } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { CreateReviewComponent } from '../create-review/create-review.component';

@Component({
  standalone: true,
  selector: 'app-album',
  imports: [NgFor, NgIf, RouterLink, CreateReviewComponent],
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css'],
})
export class AlbumComponent implements OnInit {
  album: any;
  showReviewComponent = false;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
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

  openReviewComponent() {
    this.showReviewComponent = true;
  }
}
