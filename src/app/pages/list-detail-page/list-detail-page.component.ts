import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, forkJoin, of, switchMap, filter, take, catchError } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'ngx-sonner';
import { ListService, MusicList, ListItem, ListPrivacy } from '../../services/list.service';
import { UserService } from '../../services/user.service';
import { SpotifyService } from '../../services/spotify.service';
import { AuthStateService } from '../../components/auth/data-access/auth-state.service';
import { TagInputComponent } from '../../components/tag-input/tag-input.component';
import { ItemSearchComponent, ItemPicked, ItemRef } from '../../components/item-search/item-search.component';
import { coverForSpotifyItem, nameForSpotifyItem, subtitleForSpotifyItem } from '../../utils/spotify-item.util';

interface ResolvedItem {
  item: ListItem;
  data: any;
}

const ROUTE_BY_TYPE: Record<ListItem['type'], string> = {
  artist: '/artist',
  album: '/album',
  song: '/song',
};

@Component({
  selector: 'app-list-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TagInputComponent, ItemSearchComponent],
  templateUrl: './list-detail-page.component.html',
  styleUrls: ['./list-detail-page.component.css'],
})
export class ListDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listService = inject(ListService);
  private userService = inject(UserService);
  private spotifyService = inject(SpotifyService);
  private authState = inject(AuthStateService);

  list: MusicList | null = null;
  ownerName: string = '';
  resolvedItems: ResolvedItem[] = [];
  currentUserId: string = '';
  isLoading: boolean = true;
  isEditing: boolean = false;
  editTitle: string = '';
  editDescription: string = '';
  editTags: string[] = [];
  editPrivacy: ListPrivacy = 'public';
  editRanked: boolean = true;
  showItemSearch: boolean = false;

  private subscriptions: Subscription[] = [];

  get isOwner(): boolean {
    return !!this.list && !!this.currentUserId && this.list.userId === this.currentUserId;
  }

  get isLiked(): boolean {
    return !!this.list?.likes?.includes(this.currentUserId);
  }

  ngOnInit() {
    const authSub = this.authState.authState$
      .pipe(
        filter((auth) => auth !== undefined),
        take(1)
      )
      .subscribe((authState) => {
        if (authState) this.currentUserId = authState.uid;
      });
    this.subscriptions.push(authSub);

    const listSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const listId = params.get('listId');
          if (!listId) return of(null);
          return this.listService.getById(listId);
        })
      )
      .subscribe({
        next: (list) => {
          this.list = list;
          this.isLoading = false;
          if (list) {
            this.editTitle = list.title;
            this.editDescription = list.description || '';
            this.editTags = list.tags || [];
            this.editPrivacy = list.privacy || 'public';
            this.editRanked = list.ranked ?? true;
            this.loadOwner(list.userId);
            this.resolveItems(list.items || []);
          }
        },
        error: (error) => {
          console.error('Error al cargar la lista:', error);
          this.isLoading = false;
          this.list = null;
          toast.error(error?.code === 'permission-denied' ? 'Esta lista es privada' : 'Error al cargar la lista');
        },
      });
    this.subscriptions.push(listSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadOwner(userId: string) {
    this.userService.getById(userId).then((user) => {
      this.ownerName = user?.username || 'Usuario';
    });
  }

  private resolveItems(items: ListItem[]) {
    if (items.length === 0) {
      this.resolvedItems = [];
      return;
    }

    const requests = items.map((item) =>
      this.detailsFor(item).pipe(
        catchError(() => of(null)),
        switchMap((data) => of({ item, data }))
      )
    );

    forkJoin(requests).subscribe((resolved) => {
      this.resolvedItems = resolved.filter((r) => r.data !== null);
    });
  }

  private detailsFor(item: ListItem) {
    switch (item.type) {
      case 'artist':
        return this.spotifyService.getArtistDetails(item.id);
      case 'album':
        return this.spotifyService.getAlbumDetails(item.id);
      case 'song':
        return this.spotifyService.getSongDetails(item.id);
    }
  }

  coverFor(resolved: ResolvedItem): string | null {
    return coverForSpotifyItem(resolved.item.type, resolved.data);
  }

  nameFor(resolved: ResolvedItem): string {
    return nameForSpotifyItem(resolved.data);
  }

  subtitleFor(resolved: ResolvedItem): string {
    return subtitleForSpotifyItem(resolved.item.type, resolved.data);
  }

  routeFor(resolved: ResolvedItem): any[] {
    return [ROUTE_BY_TYPE[resolved.item.type], resolved.item.id];
  }

  toggleEdit() {
    if (!this.list) return;
    if (this.isEditing) {
      this.saveDetails();
    } else {
      this.editTitle = this.list.title;
      this.editDescription = this.list.description || '';
      this.editTags = this.list.tags || [];
      this.editPrivacy = this.list.privacy || 'public';
      this.editRanked = this.list.ranked ?? true;
      this.isEditing = true;
    }
  }

  private saveDetails() {
    if (!this.list?.id) return;
    const title = this.editTitle.trim();
    if (!title) {
      toast.error('Ponle un nombre a la lista');
      return;
    }

    const updates = {
      title,
      description: this.editDescription.trim() || undefined,
      tags: this.editTags,
      privacy: this.editPrivacy,
      ranked: this.editRanked,
    };

    this.listService
      .update(this.list.id, updates)
      .then(() => {
        if (this.list) {
          this.list = { ...this.list, ...updates };
        }
        this.isEditing = false;
        toast.success('Lista actualizada');
      })
      .catch((error) => {
        console.error('Error al actualizar la lista:', error);
        toast.error('Error al actualizar la lista');
      });
  }

  removeItem(index: number) {
    if (!this.list?.id) return;
    const newItems = [...this.list.items];
    newItems.splice(index, 1);
    this.persistItems(newItems);
  }

  moveItem(index: number, direction: -1 | 1) {
    if (!this.list?.id) return;
    const target = index + direction;
    if (target < 0 || target >= this.list.items.length) return;

    const newItems = [...this.list.items];
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    this.persistItems(newItems);
  }

  private persistItems(newItems: ListItem[]) {
    if (!this.list?.id) return;
    const listId = this.list.id;
    const previousItems = this.list.items;
    const previousResolved = this.resolvedItems;

    // Optimistic UI update.
    this.list = { ...this.list, items: newItems };
    const resolvedById = new Map(previousResolved.map((r) => [`${r.item.type}:${r.item.id}`, r]));
    this.resolvedItems = newItems
      .map((item) => resolvedById.get(`${item.type}:${item.id}`))
      .filter((r): r is ResolvedItem => !!r);

    this.listService.setItems(listId, newItems).catch((error) => {
      console.error('Error al actualizar los elementos:', error);
      toast.error('Error al actualizar la lista');
      if (this.list) this.list = { ...this.list, items: previousItems };
      this.resolvedItems = previousResolved;
    });
  }

  addItemFromSearch(picked: ItemPicked) {
    if (!this.list?.id || !this.isOwner) return;
    if (this.list.items.some((i) => i.type === picked.type && i.id === picked.id)) {
      toast.error('Ya está en la lista');
      return;
    }

    const listId = this.list.id;
    const newListItem: ListItem = { type: picked.type, id: picked.id, addedAt: Timestamp.now() };
    const newItems = [...this.list.items, newListItem];

    // We already have the full Spotify object from the search result, so no extra fetch is needed.
    this.list = { ...this.list, items: newItems };
    this.resolvedItems = [...this.resolvedItems, { item: newListItem, data: picked.data }];

    this.listService.setItems(listId, newItems).catch((error) => {
      console.error('Error al agregar el elemento:', error);
      toast.error('Error al agregar el elemento');
      if (this.list) {
        this.list = { ...this.list, items: this.list.items.filter((i) => !(i.type === picked.type && i.id === picked.id)) };
      }
      this.resolvedItems = this.resolvedItems.filter((r) => !(r.item.type === picked.type && r.item.id === picked.id));
    });
  }

  removeItemFromSearch(ref: ItemRef) {
    if (!this.list) return;
    const index = this.list.items.findIndex((i) => i.type === ref.type && i.id === ref.id);
    if (index === -1) return;
    this.removeItem(index);
  }

  toggleLike() {
    if (!this.list?.id) return;
    if (!this.currentUserId) {
      toast.error('Debes iniciar sesión para dar like');
      return;
    }

    const currentLikes = this.list.likes || [];
    const liked = currentLikes.includes(this.currentUserId);
    const listId = this.list.id;

    this.list.likes = liked
      ? currentLikes.filter((id) => id !== this.currentUserId)
      : [...currentLikes, this.currentUserId];

    const request = liked
      ? this.listService.removeLike(listId, this.currentUserId)
      : this.listService.addLike(listId, this.currentUserId);

    request.catch((error) => {
      console.error('Error al dar like a la lista:', error);
      if (this.list) this.list.likes = currentLikes;
    });
  }

  async deleteList() {
    if (!this.list?.id || !this.isOwner) return;
    if (!confirm('¿Eliminar esta lista? Esta acción no se puede deshacer.')) return;

    try {
      await this.listService.delete(this.list.id);
      toast.success('Lista eliminada');
      this.router.navigate(['/lists']);
    } catch (error) {
      console.error('Error al eliminar la lista:', error);
      toast.error('Error al eliminar la lista');
    }
  }
}
