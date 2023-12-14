import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Analytics } from '@angular/fire/analytics';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Firestore, doc, onSnapshot, updateDoc, DocumentReference, DocumentData, writeBatch, addDoc, collection, collectionData } from '@angular/fire/firestore';
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

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatInputModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatCardModule, MatListModule, MatSnackBarModule],
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
  teamId: string;
  user: AppUser | null = null;
  checkups: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (!teamId) {
      throw new Error("Team ID is falsy");
    }
    this.teamId = teamId;
    this.teamRef = doc(this.firestore, 'teams', this.teamId as string);
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
      this.team.id = teamSnapshot.id;
      if (this.team.title) {
        this.teamTitle = this.team.title;
      }
      this.isLoading = false;
    });

    collectionData(collection(this.firestore, 'teams', this.teamId, 'checkups'), { idField: 'id' })
      .pipe().subscribe((checkups) => {
        this.checkups = [];
        checkups.forEach((checkup) => {
          this.checkups.push({
            id: checkup.id,
            icon: checkup['icon'],
            time: checkup['time'].toDate()
          });
        });
      });
  }

  updateTeamTitle(eventTitle: string) {
    const batch = writeBatch(this.firestore);
    batch.update(this.teamRef as DocumentReference<DocumentData>, { title: eventTitle });
    batch.update(doc(this.firestore, 'users', this.user?.uid as string, 'teams', this.teamId as string), { title: eventTitle });
    batch.commit();
  }

  updateTeam(data: any) {
    updateDoc(this.teamRef as DocumentReference<DocumentData>, data)
  }
  createNewCheckup() {
    this.isLoading = true;
    addDoc(collection(this.firestore, 'teams', this.teamId, 'checkups'), {
      icon: 'https://material.angular.io/assets/img/examples/shiba1.jpg',
      time: new Date()
    })
      .then((docRef) => {
        this.router.navigate([`checkup/${docRef.id}`]);
      });
  }
}

