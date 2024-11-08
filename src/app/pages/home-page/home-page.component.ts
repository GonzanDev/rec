import { Component } from '@angular/core';
import { AlbumListComponent } from '../../album-list/album-list.component';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [AlbumListComponent, SearchBarComponent, RouterOutlet],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
