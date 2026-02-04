import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth, browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp({
      projectId: "musicboxd-c0885",
      appId: "1:831582375078:web:8f2c362f10059d8930f867",
      storageBucket: "musicboxd-c0885.firebasestorage.app",
      apiKey: "AIzaSyAa1BF9JEcr-krkOmJwg8AvtILNI1KOJeI",
      authDomain: "musicboxd-c0885.firebaseapp.com",
      messagingSenderId: "831582375078"
    })),
    provideAuth(() => {
      const auth = getAuth();
      return auth;
    }),
    provideFirestore(() => getFirestore()),
  ],
};
