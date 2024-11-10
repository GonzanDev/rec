import { Component } from '@angular/core';
import { CancionComponent } from '../../cancion/cancion.component';
import { SearchBarComponent } from '../../search-bar/search-bar.component';

@Component({
  selector: 'app-song-page',
  standalone: true,
  imports: [CancionComponent, SearchBarComponent],
  templateUrl: './song-page.component.html',
  styleUrl: './song-page.component.css',
})
export class SongPageComponent {}
