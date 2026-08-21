
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterModule,

} from '@angular/router';
import { FormsModule } from '@angular/forms';

import {NgxSonnerToaster} from 'ngx-sonner';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { AlbumListComponent } from './components/album-list/album-list.component';
import { AuthStateService } from './components/auth/data-access/auth-state.service';
import { UserStateService } from './components/auth/data-access/user-state.service';

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
    AlbumListComponent
  ],
  standalone: true,
})
export class AppComponent implements OnInit {
  userId$: any;
  
  constructor(
    private authStateService: AuthStateService,
    private userStateService: UserStateService
  ) {
    this.userId$ = this.userStateService.userId$;
  }

  ngOnInit(): void {
    this.authStateService.initAuthStateListener();
  }
}
