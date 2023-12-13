import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(provideFirebaseApp(() => initializeApp({
        "projectId": "reflectalplatform",
        "appId": "1:558440967425:web:1cda7736bd9a4f6157ff00",
        "storageBucket": "reflectalplatform.appspot.com",
        "apiKey": "AIzaSyDRGfqmS0-esFs4ItEZMVmaLUVp4DEZNl0",
        "authDomain": "reflectalplatform.firebaseapp.com",
        "messagingSenderId": "558440967425",
        "measurementId": "G-TKQB97G9Q3"
    }))),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideAnalytics(() => getAnalytics())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideStorage(() => getStorage())),
    ScreenTrackingService,
    UserTrackingService,
    provideAnimations()
]
};
