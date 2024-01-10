import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CollectionReference, Firestore, addDoc, collection, collectionData, doc, getDoc, query, updateDoc, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Team } from '../models/team';
import { AppUser } from '../models/app-user';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatListModule, MatSnackBarModule],
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
  orgNames: { id: string, name: string }[] = [];
  today = new Date();

  constructor(
    private router: Router,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
  ) {

    onAuthStateChanged(this.auth, async (currentUser) => {
      if (!currentUser) {
        this.isLoading = false;
        return;
      }
      this.user = (await getDoc(doc(this.firestore, 'users', currentUser.uid))).data() as AppUser;
      getDoc(doc(this.firestore, 'orgs', this.user.org)).then((currentOrg) => {
        this.orgName = currentOrg.data()?.['name'];

        this.user?.orgs?.forEach((org) => {
          getDoc(doc(this.firestore, 'orgs', org)).then((org) => {
            this.orgNames.push({ id: org.id, name: org.data()?.['name'] });
          });
        });
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

  switchOrg(orgId: string) {
    if (!this.user) throw new Error('User object is falsy');
    updateDoc(doc(this.firestore, 'users', this.user.uid), { org: orgId }).then(() => {
      window.location.reload();
    });
  }

  inviteToOrg() {
    if (!this.user) throw new Error('User object is falsy');

    var inviteUrl = `${window.location.origin}/invite/${this.user.org}`;
    const invite = `Join ${this.orgName} on reflectal`;
    this.clipboard.copy(`${invite}\n${inviteUrl}`);

    if (navigator.share) {
      navigator.share({
        text: invite,
        url: inviteUrl
      })
    }
  }
}