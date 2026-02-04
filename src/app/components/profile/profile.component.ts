import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { SpotifyService } from '../../services/spotify.service';
import { NgIf } from '@angular/common';
import { AlbumListComponent } from '../album-list/album-list.component';
import { ArtistListComponent } from '../artist-list/artist-list.component';
import { ReviewFeedComponent } from '../review-feed/review-feed.component';
import { catchError, filter, take, timeout } from 'rxjs/operators';
import { combineLatest, Subscription, forkJoin, Observable, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [NgIf, AlbumListComponent, ArtistListComponent, ReviewFeedComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
   userId: string = '';
  currentUserId: string = '';
  private authState = inject(AuthStateService);
  private subscriptions: Subscription[] = [];

  user: any = null;
  favoriteAlbumsDetails: any[] = [];
  favoriteArtistsDetails: any[] = [];
  isFollowing: boolean = false;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit(): void {
  const sub = combineLatest([
    this.authState.authState$.pipe(
      filter(auth => auth !== undefined),
      take(1)
    ),
    this.route.paramMap
  ]).subscribe(([authState, params]) => {
    if (authState) {
      this.currentUserId = authState.uid;
    }

    this.userId = params.get('userId')!;
    this.loadUserProfile(this.userId);
  });

  this.subscriptions.push(sub);
}

  loadUserProfile(userId: string): void {
    this.isLoading = true;

    // Use take(1) to avoid re-fetching on document changes
    const sub = this.userService.getUserProfile(userId).pipe(take(1)).subscribe({
      next: (userProfile) => {
        this.user = userProfile;
        console.log(this.user);
        this.isLoading = false;

        if (this.user?.favoriteAlbums?.length > 0) {
          this.getFavoriteAlbumsDetails();
        }

        if (this.user?.favoriteArtists?.length > 0) {
          this.getFavoriteArtistsDetails();
        }

        this.checkIfFollowing();
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

getFavoriteArtistsDetails() {
  console.log('=== getFavoriteArtistsDetails called ===');
  console.log('favoriteArtists:', this.user.favoriteArtists);

  this.favoriteArtistsDetails = [];

  const artistRequests: Observable<any>[] = this.user.favoriteArtists.map((artistId: string) => {
    console.log('Creating request for artist:', artistId);
    return this.spotifyService.getArtistDetails(artistId).pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error fetching artist:', artistId, error);
        return of(null);
      })
    );
  });

  console.log('Total requests:', artistRequests.length);

  forkJoin(artistRequests).subscribe({
    next: (artists: any[]) => {
      console.log('=== Artists received ===', artists);
      this.favoriteArtistsDetails = artists.filter(artist => artist !== null);
      console.log('Filtered artists:', this.favoriteArtistsDetails);
    },
    error: (error) => {
      console.error('=== Error in forkJoin ===', error);
    }
  });
}

getFavoriteAlbumsDetails() {
  console.log('=== getFavoriteAlbumsDetails called ===');

  this.favoriteAlbumsDetails = [];

  const albumRequests: Observable<any>[] = this.user.favoriteAlbums.map((albumId: string) => {
    console.log('Creating request for album:', albumId);
    return this.spotifyService.getAlbumDetails(albumId).pipe(
      catchError(error => {
        console.error('Error fetching album:', albumId, error);
        return of(null);
      })
    );
  });

  forkJoin(albumRequests).subscribe({
    next: (albums: any[]) => {
      console.log('=== Albums received ===', albums);
      this.favoriteAlbumsDetails = albums.filter(album => album !== null);
    },
    error: (error) => {
      console.error('=== Error in forkJoin ===', error);
    }
  });
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
