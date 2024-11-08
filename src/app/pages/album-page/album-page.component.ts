import { Component } from '@angular/core';
import { AlbumComponent } from '../../album/album.component';
import { AlbumListComponent } from "../../album-list/album-list.component";
import { SearchBarComponent } from "../../search-bar/search-bar.component";

@Component({
  selector: 'app-album-page',
  standalone: true,
  imports: [AlbumComponent, SearchBarComponent],
  templateUrl: './album-page.component.html',
  styleUrl: './album-page.component.css'
})
export class AlbumPageComponent {

}
