import { Routes } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ArtistaComponent } from './artista/artista.component';
import { AlbumListComponent } from './album-list/album-list.component';
import { AlbumComponent } from './album/album.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AlbumPageComponent } from './pages/album-page/album-page.component';
import { CancionComponent } from './cancion/cancion.component';
import { SongPageComponent } from './pages/song-page/song-page.component';
import { ArtistPageComponent } from './pages/artist-page/artist-page.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
  },
  {
    path: 'artist/:artistId',
    component: ArtistPageComponent,
  },
  {
    path: 'album/:albumId',
    component: AlbumPageComponent
  },
  {
    path:'song/:songId',
    component:SongPageComponent
  },
  {
    path: `**`,
    redirectTo: `home`,
    pathMatch: `full`
  }
];
