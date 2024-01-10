import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Analytics } from '@angular/fire/analytics';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Firestore, doc, onSnapshot, updateDoc, DocumentReference, DocumentData, writeBatch, collection, collectionData, orderBy, query } from '@angular/fire/firestore';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Team } from '../models/team';
import { AppUser } from '../models/app-user';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { WellbeingChartComponent } from '../wellbeing-chart/wellbeing-chart.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterModule, WellbeingChartComponent, FormsModule, MatInputModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatCardModule, MatListModule, MatSnackBarModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private analytics: Analytics = inject(Analytics);
  teamRef: DocumentReference<DocumentData>;
  team: Team | undefined;
  newTeamTitle = `New Team`;
  teamTitle: string = this.newTeamTitle;
  isLoading = true;
  orgId: string;
  teamId: string;
  user: AppUser | null = null;
  members: any[] = [];
  presentationsFinished: any[] = [];
  presentationsInProgress: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clipboard: Clipboard,
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
        this.router.navigate([`/`]);
      }
      this.team = teamSnapshot.data() as Team;
      this.team.id = teamSnapshot.id;
      if (this.team.title) {
        this.teamTitle = this.team.title;
      }
      this.isLoading = false;
    });

    collectionData(query(collection(this.firestore, 'orgs', this.orgId, 'teams', this.teamId, 'members'),
      orderBy('displayName', 'asc')), { idField: 'id' })
      .pipe().subscribe((members) => {
        this.members = [];
        members.forEach((member) => {
          this.members.push({
            id: member.id,
            photoUrl: member['photoUrl'],
            displayName: member['displayName'],
          });
        });
      });

    collectionData(query(collection(this.firestore, 'orgs', this.orgId, 'teams', this.teamId, 'presentations'),
      orderBy('created', 'desc')), { idField: 'id' })
      .pipe().subscribe((presentations) => {
        this.presentationsFinished = [];
        this.presentationsInProgress = [];
        presentations.forEach((presentation) => {
          if (presentation['finished']) {
            const scores = presentation['wellbeing'];
            const percentage = (scores.reduce((a: number, b: number) => a + b - 1, 0) / (3 * scores.length)) * 100;
            this.presentationsFinished.push({
              id: presentation.id,
              created: presentation['created'].toDate(),
              finished: presentation['finished'].toDate(),
              percentage: Math.round(percentage),
            });
          } else {
            this.presentationsInProgress.push({
              id: presentation.id,
              created: presentation['created'].toDate(),
            });
          }
        });
      });
  }

  updateTeam(data: any) {
    updateDoc(this.teamRef as DocumentReference<DocumentData>, data)
  }

  inviteNewMember() {
    var inviteUrl = `${window.location.origin}/invite/${this.orgId}/${this.teamId}`;
    const invite = `Join ${this.team?.title} on reflectal`;
    this.clipboard.copy(`${invite}\n${inviteUrl}`);

    if (navigator.share) {
      navigator.share({
        text: invite,
        url: inviteUrl
      })
    }
  }

  createNewPresentation() {
    if (!this.user) throw new Error("User is falsy");
    if (!this.teamId) throw new Error("Team ID is falsy");
    this.isLoading = true;
    const created = new Date();
    const presentationId = doc(collection(this.firestore, 'orgs')).id;

    const batch = writeBatch(this.firestore);
    const newPresentation = {
      created: created,
      question1: 'It is easy to eat healthy and exercise on days I work',
      question2: 'I am confident in my career growth and progress',
      question3: 'I am happy in the leadership and direction',
    };
    batch.set(doc(this.firestore, 'orgs', this.orgId, 'teams', this.teamId, 'presentations', presentationId), newPresentation);
    batch.set(doc(this.firestore, 'presentations-in-progress', presentationId), {
      orgId: this.orgId,
      teamId: this.teamId,
      created: created,
      questions: [
        newPresentation.question1,
        newPresentation.question2,
        newPresentation.question3,
      ]
    });
    batch.commit()
      .then(() => {
        this.router.navigate(['new-presentation', this.orgId, this.teamId, presentationId]);
      });
  }
}

