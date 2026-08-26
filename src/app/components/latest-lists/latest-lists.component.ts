import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ListService, MusicList } from '../../services/list.service';
import { UserService } from '../../services/user.service';
import { ListCardComponent } from '../list-card/list-card.component';

@Component({
  selector: 'app-latest-lists',
  standalone: true,
  imports: [CommonModule, ListCardComponent],
  templateUrl: './latest-lists.component.html',
  styleUrls: ['./latest-lists.component.css'],
})
export class LatestListsComponent implements OnInit, OnDestroy {
  @ViewChild('carousel') carousel!: ElementRef;

  lists: MusicList[] = [];
  ownerNames: { [userId: string]: string } = {};
  isLoading = true;
  hasError = false;

  private listService = inject(ListService);
  private userService = inject(UserService);
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.listService.getLatestPublic(10).subscribe({
      next: (lists) => {
        this.lists = lists;
        this.isLoading = false;
        this.resolveOwnerNames(lists);
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private resolveOwnerNames(lists: MusicList[]) {
    const userIds = [...new Set(lists.map((l) => l.userId))];
    Promise.all(userIds.map((id) => this.userService.getById(id))).then((users) => {
      const names: { [userId: string]: string } = {};
      userIds.forEach((id, i) => {
        if (users[i]) names[id] = users[i]!.username || 'Usuario';
      });
      this.ownerNames = names;
    });
  }

  scrollLeft() {
    this.scrollBy(-1);
  }

  scrollRight() {
    this.scrollBy(1);
  }

  private scrollBy(direction: -1 | 1) {
    const el = this.carousel?.nativeElement;
    if (!el) return;
    const step = el.clientWidth + 10;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  }
}
