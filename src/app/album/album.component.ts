import { UserStateService } from './../auth/data-access/user-state.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import { switchMap } from 'rxjs';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CreateReviewComponent } from '../create-review/create-review.component';
import { UserService } from '../services/user.service';

@Component({
  standalone: true,
  selector: 'app-album',
  imports: [NgFor, NgIf, RouterLink, CreateReviewComponent, CommonModule],
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css'],
})
export class AlbumComponent implements OnInit {
  album: any;
  showReviewComponent = false;
  reviews: any[] = [];
  userId: any;
  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private userService: UserService,
    private userStateService: UserStateService
  ) {}

  ngOnInit() {
    this.userStateService.userId$.subscribe((id) => {
      this.userId = id || '';
    });
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

  addToFavorites() {
    if (this.userId && this.album?.id) {
      this.userService.addFavoriteAlbum(this.userId, this.album.id).then(
        () => {
          console.log('Álbum agregado a favoritos');
        },
        (error) => {
          console.error('Error al agregar álbum a favoritos:', error);
        }
      );
    } else {
      console.error('No se encontró userId o albumId');
    }
  }


  openReviewComponent() {
    this.showReviewComponent = true;
  }

  closeReviewComponent(): void {
    this.showReviewComponent = false;
  }

  onReviewCreated(review: any) {
    this.reviews.push(review);
    this.closeReviewComponent();
  }
}
