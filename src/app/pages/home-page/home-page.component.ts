import { Component } from '@angular/core';
import { AlbumListComponent } from '../../components/album-list/album-list.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { RouterOutlet } from '@angular/router';
import { ReviewFeedComponent } from '../../components/review-feed/review-feed.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [AlbumListComponent, SearchBarComponent, RouterOutlet, ReviewFeedComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'], // Cambiado a "styleUrls"
})
export class HomePageComponent {
   reviewIdFromUrl: string | null = null;
   highlightReviewId: string | null = null;


  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.reviewIdFromUrl = params.get('reviewId');
    });
  }
}
