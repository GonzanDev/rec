import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AlbumPageComponent } from './pages/album-page/album-page.component';
import { SongPageComponent } from './pages/song-page/song-page.component';
import { ArtistPageComponent } from './pages/artist-page/artist-page.component';
import { CallbackComponent } from './components/callback/callback.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  // Ruta protegida para la página de inicio
  {
    path: 'home',
    component: HomePageComponent,
    canActivate: [AuthGuard],
  },

  // Rutas de acceso directo
  {
    path: 'artist/:artistId',
    component: ArtistPageComponent,
  },
  {
    path: 'album/:albumId',
    component: AlbumPageComponent,
  },
  {
    path: 'song/:songId',
    component: SongPageComponent,
  },

  // Ruta para manejar el callback de autenticación de Spotify
  {
    path: 'callback',
    component: CallbackComponent,
  },

  // Ruta de inicio de sesión
  { path: 'login', component: LoginComponent },

  // Redirección de raíz a la página de inicio de sesión
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Redirección de rutas desconocidas a la página de inicio de sesión
  { path: '**', redirectTo: '/login' },
];
