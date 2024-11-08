import { Routes } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ArtistaComponent } from './artista/artista.component';
import { AlbumListComponent } from './album-list/album-list.component';
import { AlbumComponent } from './album/album.component';

export const routes: Routes = [
  {
    path: ' ',
    component: SearchBarComponent,
  },

  {
    path: 'artista',
    component: ArtistaComponent,
  },
  { path: '', component: AlbumListComponent },
  { path: 'album/:albumId', component: AlbumComponent }
];
