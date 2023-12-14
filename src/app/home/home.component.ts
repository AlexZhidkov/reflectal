import { Component, inject } from '@angular/core';
import { Analytics } from '@angular/fire/analytics';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import { CollectionReference, Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatCardModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private firestore: Firestore = inject(Firestore);
  private analytics: Analytics = inject(Analytics);
  usersCollection: CollectionReference;
  users: any;
  isLoading = true;
  private auth: Auth = inject(Auth);
  geoLocationError = false;
  user: User | null = null;

  constructor(
    private router: Router,
  ) {

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user;
      }
    });
    this.usersCollection = collection(this.firestore, 'users');
    collectionData(this.usersCollection, { idField: 'id' }).subscribe((users) => {
      this.users = users;
      this.isLoading = false;
    });
  }
}