import { SearchBarComponent } from './../../components/search-bar/search-bar.component';
import { Component } from '@angular/core';
import { ArtistaComponent } from '../../components/artista/artista.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-artist-page',
  standalone: true,
  imports: [ArtistaComponent, SearchBarComponent],
  templateUrl: './artist-page.component.html',
  styleUrls: ['./artist-page.component.css'], // Cambiado a "styleUrls"
})
export class ArtistPageComponent {}
