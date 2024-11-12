import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { Router} from '@angular/router';
import { UserService } from '../services/user.service';
import { NgFor, NgIf } from '@angular/common';
import { SpotifyService } from '../services/spotify.service';
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
  private authState = inject(AuthStateService);
  user: any = null;
  favoriteAlbumsDetails: any[] = [];
  favoriteArtistsDetails: any[] = [];




  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, private spotifyService: SpotifyService) {}

  ngOnInit(): void {

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

        if(this.user && this.user.favoriteArtists){
          this.getFavoriteArtistsDetails();
        }

        console.log(this.favoriteAlbumsDetails);
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

  getFavoriteArtistsDetails(){
    if(this.user.favoriteArtists.length>0){
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



  async logOut() {
    await this.authState.logOut();
    this.router.navigateByUrl('/auth/sign-in');
  }
}
