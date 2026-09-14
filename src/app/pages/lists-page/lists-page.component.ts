import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, filter, take } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'ngx-sonner';
import { ListService, MusicList, ListPrivacy, ListItem } from '../../services/list.service';
import { AuthStateService } from '../../components/auth/data-access/auth-state.service';
import { ListCardComponent } from '../../components/list-card/list-card.component';
import { TagInputComponent } from '../../components/tag-input/tag-input.component';
import { ItemSearchComponent, ItemPicked, ItemRef } from '../../components/item-search/item-search.component';
import { coverForSpotifyItem, nameForSpotifyItem, subtitleForSpotifyItem } from '../../utils/spotify-item.util';

interface DraftItem {
  item: ListItem;
  data: any;
}

@Component({
  selector: 'app-lists-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ListCardComponent, TagInputComponent, ItemSearchComponent],
  templateUrl: './lists-page.component.html',
  styleUrls: ['./lists-page.component.css'],
})
export class ListsPageComponent implements OnInit, OnDestroy {
  private authState = inject(AuthStateService);
  private listService = inject(ListService);
  private router = inject(Router);

  userId: string = '';
  lists: MusicList[] = [];
  isLoading: boolean = true;
  showCreateForm: boolean = false;
  isCreating: boolean = false;

  newTitle: string = '';
  newDescription: string = '';
  newTags: string[] = [];
  newPrivacy: ListPrivacy = 'public';
  newRanked: boolean = true;
  newItems: DraftItem[] = [];

  tagFilter: string = '';

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    const authSub = this.authState.authState$
      .pipe(
        filter((auth) => auth !== undefined),
        take(1)
      )
      .subscribe((authState) => {
        if (authState) {
          this.userId = authState.uid;
          this.loadLists();
        } else {
          this.isLoading = false;
        }
      });
    this.subscriptions.push(authSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadLists() {
    const listsSub = this.listService.getByUser(this.userId).subscribe({
      next: (lists) => {
        this.lists = lists;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        toast.error('Error al cargar las listas: ' + (error?.message || error?.code || 'error desconocido'));
      },
    });
    this.subscriptions.push(listsSub);
  }

  get filteredLists(): MusicList[] {
    const tag = this.tagFilter.trim().toLowerCase();
    if (!tag) return this.lists;
    return this.lists.filter((list) => (list.tags || []).some((t) => t.toLowerCase().includes(tag)));
  }

  get allTags(): string[] {
    const tagSet = new Set<string>();
    this.lists.forEach((list) => (list.tags || []).forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
  }

  get newListItems(): ListItem[] {
    return this.newItems.map((d) => d.item);
  }

  onNewItemAdded(picked: ItemPicked) {
    if (this.newItems.some((d) => d.item.type === picked.type && d.item.id === picked.id)) return;
    this.newItems = [
      ...this.newItems,
      { item: { type: picked.type, id: picked.id, addedAt: Timestamp.now() }, data: picked.data },
    ];
  }

  onNewItemRemoved(ref: ItemRef) {
    this.newItems = this.newItems.filter((d) => !(d.item.type === ref.type && d.item.id === ref.id));
  }

  removeDraftItem(index: number) {
    this.newItems = this.newItems.filter((_, i) => i !== index);
  }

  coverFor(draft: DraftItem): string | null {
    return coverForSpotifyItem(draft.item.type, draft.data);
  }

  nameFor(draft: DraftItem): string {
    return nameForSpotifyItem(draft.data);
  }

  subtitleFor(draft: DraftItem): string {
    return subtitleForSpotifyItem(draft.item.type, draft.data);
  }

  async createList() {
    const title = this.newTitle.trim();
    if (!title) {
      toast.error('Ponle un nombre a la lista');
      return;
    }

    this.isCreating = true;
    try {
      const docRef = await this.listService.create({
        userId: this.userId,
        title,
        description: this.newDescription.trim() || undefined,
        tags: this.newTags,
        privacy: this.newPrivacy,
        ranked: this.newRanked,
        items: this.newListItems,
        likes: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      toast.success('Lista creada');
      this.newTitle = '';
      this.newDescription = '';
      this.newTags = [];
      this.newPrivacy = 'public';
      this.newRanked = true;
      this.newItems = [];
      this.router.navigate(['/list', docRef.id]);
    } catch {
      toast.error('Error al crear la lista');
    } finally {
      this.isCreating = false;
    }
  }
}
