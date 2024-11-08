import { Routes } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ArtistaComponent } from './artista/artista.component';
import { AlbumListComponent } from './album-list/album-list.component';
import { AlbumComponent } from './album/album.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AlbumPageComponent } from './pages/album-page/album-page.component';
import { CancionComponent } from './cancion/cancion.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
  },
  {
    path: 'artista',
    component: ArtistaComponent,
  },
  {
    path: 'album/:albumId',
    component: AlbumPageComponent
  },
  {
    path:'song/:songId',
    component:CancionComponent
  },
  {
    path: `**`,
    redirectTo: `home`,
    pathMatch: `full`
  }
];
