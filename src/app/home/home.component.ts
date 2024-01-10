import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CollectionReference, Firestore, addDoc, collection, collectionData, doc, getDoc, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Team } from '../models/team';
import { AppUser } from '../models/app-user';

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
  user: AppUser | null = null;
  orgName: string = '';
  today = new Date();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
  ) {

    onAuthStateChanged(this.auth, async (currentUser) => {
      if (!currentUser) {
        this.isLoading = false;
        return;
      }
      this.user = (await getDoc(doc(this.firestore, 'users', currentUser.uid))).data() as AppUser;
      getDoc(doc(this.firestore, 'orgs', this.user.org)).then((org) => {
        this.orgName = org.data()?.['name'];
      });
      this.teamsCollection = collection(this.firestore, 'orgs', this.user.org, 'teams');
      collectionData(query(this.teamsCollection, where('owner', '==', currentUser.uid)), { idField: 'id' }).subscribe((teams) => {
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
    const teamId = doc(collection(this.firestore, 'orgs', this.user.org, 'teams')).id;
    logEvent(this.analytics, 'new_team', { uid: this.user.uid, teamId: teamId })
    const newTeam: Team = {
      owner: this.user.uid,
      dateTime: new Date(),
      icon: 'https://material.angular.io/assets/img/examples/shiba1.jpg',
      title: '',
      description: '',
    }

    addDoc(collection(this.firestore, 'orgs', this.user.org, 'teams'), newTeam).then(() => {
      this.router.navigate([`team/${teamId}`]);
    });
  }

}