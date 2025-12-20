import { UserService } from './../../services/user.service';
import { SpotifyService } from './../../services/spotify.service';
import { AuthStateService } from './../auth/data-access/auth-state.service';
import { NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, Subscription, filter, take } from 'rxjs';
import { AlbumListComponent } from '../album-list/album-list.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-artista',
  standalone: true,
  imports: [NgIf, AlbumListComponent],
  templateUrl: './artista.component.html',
  styleUrls: ['./artista.component.css'],
})
export class ArtistaComponent implements OnInit, OnDestroy {
  artist: any;
  userId: string = '';
  isFavorite: boolean = false;
  private subscriptions: Subscription[] = [];
  private authState = inject(AuthStateService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spotifyService: SpotifyService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    // Get current user ID
    const authSub = this.authState.authState$.pipe(
      filter(auth => auth !== undefined),
      take(1)
    ).subscribe(authState => {
      if (authState) {
        this.userId = authState.uid;
        console.log('User ID:', this.userId);
        // Check if artist is already a favorite after getting user
        if (this.artist?.id) {
          this.checkIfFavorite();
        }
      }
    });
    this.subscriptions.push(authSub);

    // Get artist details
    const routeSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const artistId = params.get('artistId');
          if (artistId) {
            return this.spotifyService.getArtistDetails(artistId);
          }
          return [];
        })
      )
      .subscribe({
        next: (data) => {
          this.artist = data;
          // Check if favorite after getting artist
          if (this.userId) {
            this.checkIfFavorite();
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
    this.subscriptions.push(routeSub);
  }

  checkIfFavorite() {
    this.userService.getById(this.userId).then(user => {
      if (user?.favoriteArtists?.includes(this.artist.id)) {
        this.isFavorite = true;
      }
    });
  }

  addToFavorites() {
    if (!this.userId) {
      toast.error('Debes iniciar sesión');
      return;
    }

    if (!this.artist?.id) {
      toast.error('Error al obtener el artista');
      return;
    }

    if (this.isFavorite) {
      this.userService.removeFavoriteArtist(this.userId, this.artist.id)
        .then(() => {
          this.isFavorite = false;
          toast.success('Artista eliminado de favoritos');
        })
        .catch((error) => {
          console.error('Error:', error);
          toast.error('Error al eliminar de favoritos');
        });
    } else {
      this.userService.addFavoriteArtist(this.userId, this.artist.id)
        .then(() => {
          this.isFavorite = true;
          toast.success('Artista agregado a favoritos');
        })
        .catch((error) => {
          console.error('Error:', error);
          toast.error('Error al agregar a favoritos');
        });
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
