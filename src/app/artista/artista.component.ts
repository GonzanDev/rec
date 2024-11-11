import { NgFor, NgIf } from '@angular/common';
import { SpotifyService } from './../services/spotify.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, Subscription } from 'rxjs';
import { AlbumListComponent } from '../album-list/album-list.component';

@Component({
  selector: 'app-artista',
  standalone: true,
  imports: [NgIf, NgFor, AlbumListComponent],
  templateUrl: './artista.component.html',
  styleUrls: ['./artista.component.css'],
})
export class ArtistaComponent implements OnInit, OnDestroy {
  artist: any;
  private routeSub!: Subscription;
  albumListComponent: AlbumListComponent | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap
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
          console.error(error);
        }
      );

    // Suscribirse a los cambios en los parámetros de la ruta
    this.route.params.subscribe((params) => {
      const artistId = params['artistId'];
      if (artistId) {
        this.router
          .navigateByUrl(`/artist/${artistId}`, { skipLocationChange: true })
          .then(() => {
            this.router.navigate([`/artist/${artistId}`]);
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  updateAlbumList() {
    if (this.albumListComponent) {
      this.albumListComponent.artistId = this.artist.id;
      this.albumListComponent.loadAlbums();
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
