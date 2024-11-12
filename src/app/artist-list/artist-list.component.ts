import { NgFor } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-artist-list',
  standalone: true,
  imports:[NgFor],
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.css']
})
export class ArtistListComponent {

  @Input() artists: any[] = [];
  @ViewChild('carousel') carousel!: ElementRef;

  constructor(private router: Router) {}

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }


  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }


  viewArtistDetails(artistId: string) {
    this.router.navigate([`/artist`, artistId]);
  }
}
