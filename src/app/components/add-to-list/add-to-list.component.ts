import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { toast } from 'ngx-sonner';
import { ListService, MusicList, ListItem } from '../../services/list.service';

@Component({
  selector: 'app-add-to-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-to-list.component.html',
  styleUrls: ['./add-to-list.component.css'],
})
export class AddToListComponent implements OnInit, OnDestroy {
  @Input({ required: true }) itemType!: 'artist' | 'album' | 'song';
  @Input({ required: true }) itemId!: string;
  @Output() close = new EventEmitter<void>();

  userId: string = '';
  lists: MusicList[] = [];
  isLoading: boolean = true;
  newListTitle: string = '';
  isCreating: boolean = false;

  private listsSub?: Subscription;

  constructor(private listService: ListService, private auth: Auth) {}

  ngOnInit() {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      this.isLoading = false;
      return;
    }
    this.userId = currentUser.uid;

    this.listsSub = this.listService.getByUser(this.userId).subscribe({
      next: (lists) => {
        this.lists = lists;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar las listas:', error);
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy() {
    this.listsSub?.unsubscribe();
  }

  closeModal() {
    this.close.emit();
  }

  isInList(list: MusicList): boolean {
    return (list.items || []).some((i) => i.type === this.itemType && i.id === this.itemId);
  }

  toggleList(list: MusicList) {
    if (!list.id) return;

    const currentItems = list.items || [];
    const newItems = this.isInList(list)
      ? currentItems.filter((i) => !(i.type === this.itemType && i.id === this.itemId))
      : [...currentItems, this.newItem()];

    this.listService.setItems(list.id, newItems).catch((error) => {
      console.error('Error al actualizar la lista:', error);
      toast.error('Error al actualizar la lista');
    });
  }

  async createAndAdd() {
    if (!this.userId) {
      toast.error('Debes iniciar sesión');
      return;
    }

    const title = this.newListTitle.trim();
    if (!title) {
      toast.error('Ponle un nombre a la lista');
      return;
    }

    this.isCreating = true;
    try {
      await this.listService.create({
        userId: this.userId,
        title,
        tags: [],
        privacy: 'public',
        ranked: true,
        items: [this.newItem()],
        likes: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      this.newListTitle = '';
      toast.success('Lista creada');
    } catch (error) {
      console.error('Error al crear la lista:', error);
      toast.error('Error al crear la lista');
    } finally {
      this.isCreating = false;
    }
  }

  private newItem(): ListItem {
    return { type: this.itemType, id: this.itemId, addedAt: Timestamp.now() };
  }
}
