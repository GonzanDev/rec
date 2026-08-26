
import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterModule,
  Router,

} from '@angular/router';
import { FormsModule } from '@angular/forms';

import {NgxSonnerToaster} from 'ngx-sonner';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { AlbumListComponent } from './components/album-list/album-list.component';
import { LatestListsComponent } from './components/latest-lists/latest-lists.component';
import { AuthStateService } from './components/auth/data-access/auth-state.service';
import { UserStateService } from './components/auth/data-access/user-state.service';
import { UserService } from './services/user.service';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    FormsModule, // Add FormsModule here
    NgxSonnerToaster,
    SearchBarComponent,
    AlbumListComponent,
    LatestListsComponent
  ],
  standalone: true,
})
export class AppComponent implements OnInit {
  userId$: any;
  photoURL$: Observable<string | null>;
  profileMenuOpen = false;

  constructor(
    private authStateService: AuthStateService,
    private userStateService: UserStateService,
    private userService: UserService,
    private elementRef: ElementRef,
    private router: Router
  ) {
    this.userId$ = this.userStateService.userId$;
    this.photoURL$ = this.userId$.pipe(
      switchMap((userId: string | null) =>
        userId ? this.userService.getUserProfile(userId).pipe(map((u: any) => u?.photoURL || null)) : of(null)
      )
    );
  }

  ngOnInit(): void {
    this.authStateService.initAuthStateListener();
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  async logOut(): Promise<void> {
    this.closeProfileMenu();
    await this.authStateService.logOut();
    this.router.navigateByUrl('/auth/sign-in');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.profileMenuOpen) return;
    // Hay dos triggers en el DOM (el del sidebar en desktop y el del header
    // en mobile) — solo uno visible según el breakpoint. Hay que chequear
    // que el click no haya sido dentro de NINGUNO de los dos.
    const menus: NodeListOf<Element> = this.elementRef.nativeElement.querySelectorAll('.profile-menu');
    const clickedInsideAMenu = Array.from(menus).some((menu) => menu.contains(event.target as Node));
    if (!clickedInsideAMenu) {
      this.profileMenuOpen = false;
    }
  }
}
