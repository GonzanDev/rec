

import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AlbumPageComponent } from './pages/album-page/album-page.component';
import { SongPageComponent } from './pages/song-page/song-page.component';
import { ArtistPageComponent } from './pages/artist-page/artist-page.component';
import { ExplorePageComponent } from './pages/explore-page/explore-page.component';
import { LibraryPageComponent } from './pages/library-page/library-page.component';
import { CreateReviewComponent } from './components/create-review/create-review.component';


import { SignInComponent } from './components/auth/features/sign-in/sign-in.component';
import { SignUpComponent } from './components/auth/features/sign-up/sign-up.component';
import { privateGuard, publicGuard } from './auth.guard';

import { ProfilePageComponent } from './pages/profile-page/profile-page.component';


export const routes: Routes = [
  // Ruta protegida para la página de inicio
  {
    path: 'home',
    component: HomePageComponent,
    canActivate: [privateGuard()],
  },
  {
    path: 'explore',
    component: ExplorePageComponent,
    canActivate: [privateGuard()],
  },
  
  // Rutas en construcción
  { path: 'favorites', component: LibraryPageComponent, canActivate: [privateGuard()] },
  { path: 'saved', component: LibraryPageComponent, canActivate: [privateGuard()] },
  { path: 'following', component: LibraryPageComponent, canActivate: [privateGuard()] },
  { path: 'playlists', component: LibraryPageComponent, canActivate: [privateGuard()] },

  { path: 'create-review', component: CreateReviewComponent },

  {
    path: 'users/:userId',
    component: ProfilePageComponent,
    canActivate: [privateGuard()],
  },

  {
    path: 'auth/sign-in',
    component:SignInComponent,
    canActivate: [publicGuard()]
  },

  {
    path: 'auth/sign-up',
    component:SignUpComponent,
    canActivate: [publicGuard()]
  },


  // Rutas de acceso directo
  {
    path: 'artist/:artistId',
    component: ArtistPageComponent,
    canActivate: [privateGuard()],
  },
  {
    path: 'album/:albumId',
    component: AlbumPageComponent,
    canActivate: [privateGuard()],
  },
  {
    path: 'song/:songId',
    component: SongPageComponent,
    canActivate: [privateGuard()],
  },
  {
  path: 'review/:reviewId',
  component: HomePageComponent,
  canActivate: [privateGuard()],
},

  {
    path: '**',
    redirectTo: '/home'
  }

];
