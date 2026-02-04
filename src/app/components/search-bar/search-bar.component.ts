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
import { SpotifyService } from '../../services/spotify.service';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AuthStateService } from '../auth/data-access/auth-state.service';
import { UserStateService } from '../auth/data-access/user-state.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  private userIdSubscription!: Subscription;
  private userProfileSubscription!: Subscription;

  userId: string | null = null;
  userName: string | null = null; // Para almacenar el nombre del usuario

  constructor(
    private spotifyService: SpotifyService,
    private router: Router,
    private elRef: ElementRef,
    private userStateService: UserStateService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Suscribirse al ID del usuario
    this.userIdSubscription = this.userStateService.userId$.subscribe(
      (userId) => {
        this.userId = userId;
        if (userId) {
          // Obtener y suscribirse al perfil del usuario
          this.userProfileSubscription = this.userService
            .getUserProfile(userId)
            .subscribe(
              (userProfile) => {
                if (userProfile) {
                  this.userName = userProfile.username || null; // Asigna el nombre del usuario
                }
              },
              (error) => {
                console.error('Error al obtener el perfil del usuario:', error);
              }
            );
        }
      }
    );

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
    if (this.userIdSubscription) this.userIdSubscription.unsubscribe();
    if (this.userProfileSubscription)
      this.userProfileSubscription.unsubscribe();
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
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
    this.router.navigate(['/home']);
  }

  goToProfile() {
    if (this.userId) {
      this.router.navigate([`/users/${this.userId}`]);
    } else {
      console.warn('El usuario no está autenticado');
    }
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
