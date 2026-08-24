import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SpotifyService } from '../../services/spotify.service';
import { MusicList } from '../../services/list.service';

const MAX_COVERS = 4;

@Component({
  selector: 'app-list-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.css'],
})
export class ListCardComponent implements OnChanges {
  @Input({ required: true }) list!: MusicList;
  @Input() ownerName?: string;

  covers: string[] = [];

  constructor(private spotifyService: SpotifyService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['list']) {
      this.loadCovers();
    }
  }

  private loadCovers() {
    this.covers = [];
    const firstItems = (this.list?.items || []).slice(0, MAX_COVERS);
    if (firstItems.length === 0) return;

    const requests = firstItems.map((item) => this.coverFor(item.type, item.id));

    forkJoin(requests).subscribe((covers) => {
      this.covers = covers.filter((c): c is string => !!c);
    });
  }

  private coverFor(type: 'artist' | 'album' | 'song', id: string) {
    const request$ =
      type === 'artist'
        ? this.spotifyService.getArtistDetails(id).pipe(map((data) => data?.images?.[0]?.url))
        : type === 'album'
        ? this.spotifyService.getAlbumDetails(id).pipe(map((data) => data?.images?.[0]?.url))
        : this.spotifyService.getSongDetails(id).pipe(map((data) => data?.album?.images?.[0]?.url));

    return request$.pipe(catchError(() => of(undefined)));
  }
}
