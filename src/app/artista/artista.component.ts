import { UserStateService } from './../auth/data-access/user-state.service';
import { NgFor, NgIf } from '@angular/common';
import { SpotifyService } from './../services/spotify.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, Subscription } from 'rxjs';
import { AlbumListComponent } from '../album-list/album-list.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-artista',
  standalone: true,
  imports: [NgIf, AlbumListComponent],
  templateUrl: './artista.component.html',
  styleUrls: ['./artista.component.css'],
})
export class ArtistaComponent implements OnInit, OnDestroy {
  artist: any;
  private routeSub!: Subscription;
  albumListComponent: AlbumListComponent | undefined;
  userId: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spotifyService: SpotifyService,
    private userService: UserService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit() {
    this.userStateService.userId$.subscribe((id) => {
      this.userId = id || '';
    });
    this.routeSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const artistId = params.get('artistId');
          if (artistId) {
            return this.spotifyService.getArtistDetails(artistId);
          }
          return [];
        })
      )
      .subscribe(
        (data) => {
          this.artist = data;
        },
        (error) => {
          console.error(error);
        }
      );


  }

  addToFavorites() {
    if (this.userId && this.artist?.id) {
      this.userService.addFavoriteArtist(this.userId, this.artist.id).then(
        () => {
          console.log('Artista agregado a favoritos');
        },
        (error) => {
          console.error('Error al agregar álbum a favoritos:', error);
        }
      );
    } else {
      console.error('No se encontró userId o artistId');
    }
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  updateAlbumList() {
    if (this.albumListComponent) {
      this.albumListComponent;
    }
  }
  formatGenres(genres: string[]): string {
    return genres
      .map((genre) => genre.charAt(0).toUpperCase() + genre.slice(1))
      .join(', ');
  }

  formatFollowers(followers: number): string {
    return followers.toLocaleString();
  }
}
