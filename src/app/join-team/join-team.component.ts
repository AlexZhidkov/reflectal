import { Component, inject } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, DocumentReference, DocumentData, doc, onSnapshot, writeBatch } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Team } from '../models/team';
import { AppUser } from '../models/app-user';

@Component({
  selector: 'app-join-team',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './join-team.component.html',
  styleUrl: './join-team.component.scss'
})
export class JoinTeamComponent {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private analytics: Analytics = inject(Analytics);
  teamRef: DocumentReference<DocumentData>;
  orgId: string;
  teamId: string;
  team: Team | undefined;
  user: AppUser | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    const orgId = this.route.snapshot.paramMap.get('orgId');
    if (!orgId) throw new Error("Org ID is falsy");
    this.orgId = orgId;
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (!teamId) throw new Error("Team ID is falsy");
    this.teamId = teamId;

    this.teamRef = doc(this.firestore, 'orgs', this.orgId, 'teams', this.teamId);
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        console.error('User object is falsy');
        return;
      }
      this.user = Object.assign(user);
    });
    onSnapshot(this.teamRef, async (teamSnapshot) => {
      if (!teamSnapshot.exists()) {
        console.error('Team does not exist');
        this.snackBar.open(`Team was deleted`, 'OK', {
          duration: 5000
        });
      }
      this.team = teamSnapshot.data() as Team;
      this.isLoading = false;
    });
  }

  joinTeam() {
    if (!this.user) throw new Error('User object is falsy');
    if (!this.team) throw new Error('Team object is falsy');

    const batch = writeBatch(this.firestore);
    batch.set(doc(this.firestore, 'orgs', this.orgId, 'teams', this.teamId, 'members', this.user.uid), {
      displayName: this.user.displayName,
      photoURL: this.user.photoURL
    });
    /* ToDo: Need to decide if we need to keep a collection of teams on user profile
    batch.set(doc(this.firestore, 'users', this.user.uid, 'teams', this.teamId), {
      title: this.team.title,
      photoURL: this.user.photoURL
    });
    */
    batch.commit().then(() => {
      logEvent(this.analytics, 'join_team', {
        teamId: this.teamId,
        uid: this.auth.currentUser?.uid,
      });
      this.router.navigate(['/team', this.teamId]);
    });
  }
}
