import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { SpotifyService } from '../services/spotify.service';
import { NgFor, NgIf } from '@angular/common';
import { AlbumListComponent } from '../album-list/album-list.component';
import { ArtistListComponent } from '../artist-list/artist-list.component';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [NgIf, AlbumListComponent, ArtistListComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  userId: string = '';
  currentUserId: string = ''; // El ID del usuario actualmente autenticado
  private authState = inject(AuthStateService);
  user: any = null;
  favoriteAlbumsDetails: any[] = [];
  favoriteArtistsDetails: any[] = [];
  isFollowing: boolean = false; // Estado para saber si el usuario sigue al perfil

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit(): void {
    // Obtener el ID del usuario autenticado
    this.authState.authState$.subscribe(authState => {
      if (authState) {
        this.currentUserId = authState.uid;
      }
    });

    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('userId')!;
      this.loadUserProfile(this.userId);
    });
  }

  loadUserProfile(userId: string): void {
    this.userService.getUserProfile(userId).subscribe(
      (userProfile) => {
        this.user = userProfile;
        console.log(this.user);

        if (this.user && this.user.favoriteAlbums) {
          this.getFavoriteAlbumsDetails();
        }

        if (this.user && this.user.favoriteArtists) {
          this.getFavoriteArtistsDetails();
        }

        this.checkIfFollowing(); // Verificar si el usuario sigue a este perfil
      },
      (error) => {
        console.error('Error loading user profile:', error);
      }
    );
  }

  getFavoriteAlbumsDetails() {
    if (this.user.favoriteAlbums.length > 0) {
      const albumIds = this.user.favoriteAlbums;
      this.favoriteAlbumsDetails = [];
      albumIds.forEach((albumId: string) => {
        this.spotifyService.getAlbumDetails(albumId).subscribe(
          (albumDetails) => {
            this.favoriteAlbumsDetails.push(albumDetails);
          },
          (error) => {
            console.error('Error al obtener los detalles del álbum', error);
          }
        );
      });
    }
  }

  getFavoriteArtistsDetails() {
    if (this.user.favoriteArtists.length > 0) {
      const artistsId = this.user.favoriteArtists;
      this.favoriteArtistsDetails = [];
      artistsId.forEach((artistId: string) => {
        this.spotifyService.getArtistDetails(artistId).subscribe(
          (artistDetails) => {
            this.favoriteArtistsDetails.push(artistDetails);
          },
          (error) => {
            console.error('Error al obtener los detalles del artista', error);
          }
        );
      });
    }
  }

  checkIfFollowing() {
    if (this.user && this.currentUserId) {
      this.userService.isFollowing(this.currentUserId, this.userId).subscribe((isFollowing) => {
        this.isFollowing = isFollowing;
      });
    }
  }

  followUser() {
    if (this.currentUserId && this.userId) {
      this.userService.addFollower(this.userId, this.currentUserId).then(() => {
        this.isFollowing = true; // Actualizar estado a "siguiendo"
      }).catch((error) => {
        console.error('Error al seguir al usuario:', error);
      });
    }
  }

  unfollowUser() {
    if (this.currentUserId && this.userId) {
      this.userService.removeFollower(this.userId, this.currentUserId).then(() => {
        this.isFollowing = false; // Actualizar estado a "no siguiendo"
      }).catch((error) => {
        console.error('Error al dejar de seguir al usuario:', error);
      });
    }
  }

  async logOut() {
    await this.authState.logOut();
    this.router.navigateByUrl('/auth/sign-in');
  }
}
