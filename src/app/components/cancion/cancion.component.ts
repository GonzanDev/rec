import { NgFor, NgIf } from '@angular/common';
import { SpotifyService } from '../../services/spotify.service';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { filter, switchMap, take } from 'rxjs';
import { toast } from 'ngx-sonner';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { AddToListComponent } from '../add-to-list/add-to-list.component';

@Component({
  selector: 'app-cancion',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, AddToListComponent],
  templateUrl: './cancion.component.html',
  styleUrls: ['./cancion.component.css']
})
export class CancionComponent {
  song: any;
  userId: string = '';
  showAddToList: boolean = false;
  private authState = inject(AuthStateService);

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit() {
    this.authState.authState$
      .pipe(
        filter((auth) => auth !== undefined),
        take(1)
      )
      .subscribe((authState) => {
        if (authState) this.userId = authState.uid;
      });

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const songId = params.get('songId'); // Cambiado de albumId a songId
          if (songId) {
            return this.spotifyService.getSongDetails(songId); // Asegúrate de tener este método en el servicio
          }
          return [];
        })
      )
      .subscribe(
        (data) => {
          this.song = data;
        },
        () => {}
      );
  }

  openAddToList() {
    if (!this.userId) {
      toast.error('Debes iniciar sesión');
      return;
    }
    this.showAddToList = true;
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  }
}
