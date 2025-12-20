import { SearchBarComponent } from './../../components/search-bar/search-bar.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumComponent } from '../../components/album/album.component';


@Component({
  selector: 'app-album-page',
  templateUrl: './album-page.component.html',
  styleUrls: ['./album-page.component.css'],
  standalone: true,
  imports: [CommonModule, AlbumComponent, SearchBarComponent],
})
export class AlbumPageComponent {

}
