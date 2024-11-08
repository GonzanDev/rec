import { Component } from '@angular/core';
import { ArtistaComponent } from "../../artista/artista.component";
import { SearchBarComponent } from '../../search-bar/search-bar.component';

@Component({
  selector: 'app-artist-page',
  standalone: true,
  imports: [ArtistaComponent, SearchBarComponent],
  templateUrl: './artist-page.component.html',
  styleUrl: './artist-page.component.css'
})
export class ArtistPageComponent {

}
