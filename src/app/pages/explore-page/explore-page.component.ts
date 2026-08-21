import { Component } from '@angular/core';
import { AlbumListComponent } from '../../components/album-list/album-list.component';

@Component({
  selector: 'app-explore-page',
  standalone: true,
  imports: [AlbumListComponent],
  templateUrl: './explore-page.component.html',
  styleUrl: './explore-page.component.css'
})
export class ExplorePageComponent {

}
