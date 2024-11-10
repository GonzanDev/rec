
import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AlbumPageComponent } from './pages/album-page/album-page.component';
import { SongPageComponent } from './pages/song-page/song-page.component';
import { ArtistPageComponent } from './pages/artist-page/artist-page.component';
import { CreateReviewComponent } from './create-review/create-review.component';


import { SignInComponent } from './auth/features/sign-in/sign-in.component';
import { SignUpComponent } from './auth/features/sign-up/sign-up.component';
import { privateGuard, publicGuard } from './auth.guard';


export const routes: Routes = [
  // Ruta protegida para la página de inicio
  {
    path: 'home',
    component: HomePageComponent,
    canActivate: [privateGuard()],
  },
  { path: 'create-review', component: CreateReviewComponent },

  {
    path: 'auth/sign-in',
    component:SignInComponent,
    canActivate: [publicGuard()]
  },

  {
    path: 'auth/sign-up',
    component:SignUpComponent,
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

 /* // Ruta para manejar el callback de autenticación de Spotify
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
   */
];
