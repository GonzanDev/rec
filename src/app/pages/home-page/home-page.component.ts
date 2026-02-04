import { Component } from '@angular/core';
import { AlbumListComponent } from '../../components/album-list/album-list.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { RouterOutlet } from '@angular/router';
import { ReviewFeedComponent } from '../../components/review-feed/review-feed.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [AlbumListComponent, SearchBarComponent, RouterOutlet, ReviewFeedComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'], // Cambiado a "styleUrls"
})
export class HomePageComponent {}
