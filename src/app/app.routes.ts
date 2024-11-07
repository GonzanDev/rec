import { Routes } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ArtistaComponent } from './artista/artista.component';

export const routes: Routes = [
  {
    path: ' ',
    component: SearchBarComponent,
  },

  {
    path: 'artista',
    component: ArtistaComponent,
  },
];
