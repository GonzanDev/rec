
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterModule,

} from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ArtistaComponent } from './artista/artista.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { AlbumListComponent } from './album-list/album-list.component';

import {NgxSonnerToaster} from 'ngx-sonner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    FormsModule, // Add FormsModule here
    NgxSonnerToaster
  ],
  standalone: true,
})
export class AppComponent {
}
