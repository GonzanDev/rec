import { Component } from '@angular/core';
import { ArtistaComponent } from '../../artista/artista.component';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-artist-page',
  standalone: true,
  imports: [ArtistaComponent, SearchBarComponent],
  templateUrl: './artist-page.component.html',
  styleUrls: ['./artist-page.component.css'], // Cambiado a "styleUrls"
})
export class ArtistPageComponent {}
