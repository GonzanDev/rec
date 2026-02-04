import { Component } from '@angular/core';
import { CancionComponent } from '../../components/cancion/cancion.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

@Component({
  selector: 'app-song-page',
  standalone: true,
  imports: [CancionComponent, SearchBarComponent],
  templateUrl: './song-page.component.html',
  styleUrl: './song-page.component.css',
})
export class SongPageComponent {}
