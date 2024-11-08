import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AlbumPageComponent } from './pages/album-page/album-page.component';
import { SongPageComponent } from './pages/song-page/song-page.component';
import { ArtistPageComponent } from './pages/artist-page/artist-page.component';
import { CallbackComponent } from './components/callback/callback.component';
import { LoginComponent } from './login/login.component';

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
  { path: 'login', component: LoginComponent },
  // Aquí puedes agregar la ruta de callback también
  { path: 'callback', loadComponent: () => import('./components/callback/callback.component').then(m => m.CallbackComponent) },

  {
    path: `**`,
    redirectTo: `home`,
    pathMatch: `full`
  }
];
