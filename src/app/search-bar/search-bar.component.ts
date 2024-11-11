import {
  Component,
  HostListener,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotifyService } from '../services/spotify.service';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../auth/data-access/auth-state.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    RouterModule,
    ],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  searchResults: any = {
    tracks: [],
    albums: [],
    artists: [],
  };
  showResults: boolean = false;
  @ViewChild('resultsBox') resultsBox!: ElementRef;

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  private authState = inject(AuthStateService);

  constructor(
    private spotifyService: SpotifyService,
    private router: Router,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    // Configura la suscripción para realizar la búsqueda después de un tiempo de espera
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300), // Espera 300ms después de que el usuario deje de escribir
        switchMap((term) => {
          if (term.trim()) {
            return this.spotifyService.search(term);
          } else {
            this.showResults = false;
            return []; // Si el término está vacío, devolver una lista vacía
          }
        })
      )
      .subscribe(
        (response: any) => {
          if (response) {
            this.searchResults.tracks = response.tracks.items;
            this.searchResults.albums = response.albums.items;
            this.searchResults.artists = response.artists.items;
            this.showResults =
              this.searchResults.tracks.length > 0 ||
              this.searchResults.albums.length > 0 ||
              this.searchResults.artists.length > 0;
          }
        },
        (error) => {
          console.error(error);
          this.showResults = false;
        }
      );
  }

  ngOnDestroy() {
    // Limpia la suscripción cuando se destruye el componente
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchTermChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term); // Emite el término de búsqueda al Subject
  }

  viewSongDetails(songId: string) {
    this.router.navigate([`/song`, songId]);
    this.showResults = false; // Cierra los resultados en la navegación
  }

  viewAlbumDetails(albumId: string) {
    this.router.navigate([`/album`, albumId]);
    this.showResults = false; // Cierra los resultados en la navegación
  }

  viewArtistDetails(artistId: string) {
    this.router.navigate([`/artist`, artistId]);
    this.showResults = false; // Cierra los resultados en la navegación
  }

  goHome() {
    this.router.navigate([`/home`]);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async logOut(){
    await this.authState.logOut();
    this.router.navigateByUrl('/auth/sign-in');
  }

  // Detecta clics fuera de los resultados para cerrarlos
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.resultsBox &&
      this.showResults &&
      !this.elRef.nativeElement.contains(event.target)
    ) {
      this.showResults = false;
    }
  }
}
