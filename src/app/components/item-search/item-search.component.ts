import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { SpotifyService } from '../../services/spotify.service';
import { ListItem } from '../../services/list.service';
import { coverForSpotifyItem, subtitleForSpotifyItem, SpotifyItemType } from '../../utils/spotify-item.util';

export interface ItemPicked {
  type: SpotifyItemType;
  id: string;
  /** Raw Spotify object from the search response — reused as-is so callers don't need a second fetch. */
  data: any;
}

export interface ItemRef {
  type: SpotifyItemType;
  id: string;
}

@Component({
  selector: 'app-item-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.css'],
})
export class ItemSearchComponent implements OnDestroy {
  @Input() existingItems: ListItem[] = [];
  @Output() itemAdded = new EventEmitter<ItemPicked>();
  @Output() itemRemoved = new EventEmitter<ItemRef>();

  searchTerm: string = '';
  isSearching: boolean = false;
  results: { artists: any[]; albums: any[]; tracks: any[] } = { artists: [], albums: [], tracks: [] };

  private searchSubject = new Subject<string>();
  private searchSub: Subscription;

  constructor(private spotifyService: SpotifyService) {
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap((term) => {
          if (!term.trim()) {
            this.results = { artists: [], albums: [], tracks: [] };
            this.isSearching = false;
            return [];
          }
          this.isSearching = true;
          return this.spotifyService.search(term);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.isSearching = false;
          if (!response) return;
          this.results = {
            artists: response.artists?.items || [],
            albums: response.albums?.items || [],
            tracks: response.tracks?.items || [],
          };
        },
        error: () => {
          this.isSearching = false;
        },
      });
  }

  ngOnDestroy() {
    this.searchSub.unsubscribe();
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  hasResults(): boolean {
    return this.results.artists.length > 0 || this.results.albums.length > 0 || this.results.tracks.length > 0;
  }

  isAdded(type: SpotifyItemType, id: string): boolean {
    return this.existingItems.some((i) => i.type === type && i.id === id);
  }

  toggle(type: SpotifyItemType, data: any) {
    const id = data.id;
    if (this.isAdded(type, id)) {
      this.itemRemoved.emit({ type, id });
    } else {
      this.itemAdded.emit({ type, id, data });
    }
  }

  cover(type: SpotifyItemType, data: any): string | null {
    return coverForSpotifyItem(type, data);
  }

  subtitle(type: SpotifyItemType, data: any): string {
    return subtitleForSpotifyItem(type, data);
  }
}
