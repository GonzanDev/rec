import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumComponent } from '../../album/album.component';
import { SearchBarComponent } from '../../search-bar/search-bar.component';

@Component({
  selector: 'app-album-page',
  templateUrl: './album-page.component.html',
  styleUrls: ['./album-page.component.css'],
  standalone: true,
  imports: [CommonModule, AlbumComponent, SearchBarComponent],
})
export class AlbumPageComponent {

}
