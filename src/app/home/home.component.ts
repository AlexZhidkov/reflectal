import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import { CollectionReference, Firestore, collection, collectionData, doc, writeBatch } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Team } from '../models/team';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatCardModule, MatListModule, MatSnackBarModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private firestore: Firestore = inject(Firestore);
  private analytics: Analytics = inject(Analytics);
  teamsCollection: CollectionReference | undefined;
  teams: any;
  isLoading = true;
  private auth: Auth = inject(Auth);
  geoLocationError = false;
  user: User | null = null;
  today = new Date();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
  ) {

    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.isLoading = false;
        return;
      }
      this.user = user;
      this.teamsCollection = collection(this.firestore, 'users', user?.uid, 'teams');
      collectionData(this.teamsCollection, { idField: 'id' }).subscribe((teams) => {
        this.teams = teams;
        this.isLoading = false;
      });
    });
  }

  createNewTeam(): void {
    if (!this.user) {
      console.error('User object is falsy');
      this.snackBar.open(`Please sign in to continue`, 'OK');
      this.router.navigate([`login`]);
      return;
    }
    const teamId = doc(collection(this.firestore, 'teams')).id;
    logEvent(this.analytics, 'new_team', { uid: this.user.uid, teamId: teamId })
    const batch = writeBatch(this.firestore);
    const newTeam: Team = {
      owner: this.user.uid,
      dateTime: new Date(),
      icon: 'https://material.angular.io/assets/img/examples/shiba1.jpg',
      title: '',
      description: '',
    }

    batch.set(doc(collection(this.firestore, 'teams'), teamId), newTeam);
    batch.set(doc(collection(this.firestore, 'users', this.user.uid, 'teams'), teamId), {
      dateTime: newTeam.dateTime,
      icon: this.user.photoURL,
    });
    batch.commit().then(() => {
      this.router.navigate([`team/${teamId}`]);
    });
  }

}