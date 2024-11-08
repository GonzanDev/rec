import { Component } from '@angular/core';
import { AlbumComponent } from '../../album/album.component';
import { AlbumListComponent } from "../../album-list/album-list.component";

@Component({
  selector: 'app-album-page',
  standalone: true,
  imports: [AlbumComponent],
  templateUrl: './album-page.component.html',
  styleUrl: './album-page.component.css'
})
export class AlbumPageComponent {

}
