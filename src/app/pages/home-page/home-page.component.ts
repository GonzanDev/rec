import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para el *ngIf y [class.active]
import { AlbumListComponent } from '../../components/album-list/album-list.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { ReviewFeedComponent } from '../../components/review-feed/review-feed.component';
import { AuthStateService } from '../../components/auth/data-access/auth-state.service';
import { UserService } from '../../services/user.service';
import { filter, take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, AlbumListComponent, SearchBarComponent, RouterOutlet, ReviewFeedComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  reviewIdFromUrl: string | null = null;
  
  // Variables para el filtro
  currentMode: 'all' | 'following' = 'all';
  followingIds: string[] = [];

  private route = inject(ActivatedRoute);
  private authState = inject(AuthStateService);
  private userService = inject(UserService);

  ngOnInit() {
    // 1. Obtener ID de la URL
    this.route.paramMap.subscribe(params => {
      this.reviewIdFromUrl = params.get('reviewId');
    });

    // 2. Obtener los IDs de las personas que sigue el usuario logueado
    this.authState.authState$.pipe(
      filter(auth => !!auth), // Esperar a que el auth esté listo
      take(1),
      switchMap(user => this.userService.getUserProfile(user!.uid))
    ).subscribe(profile => {
      if (profile) {
        this.followingIds = profile.following || [];
      }
    });
  }

  setMode(mode: 'all' | 'following') {
    this.currentMode = mode;
  }
}