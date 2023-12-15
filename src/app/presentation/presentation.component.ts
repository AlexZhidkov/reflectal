import { Component, inject } from '@angular/core';
import { Firestore, collection, deleteDoc, doc, getDocs, updateDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [RouterModule, FormsModule, QRCodeModule, MatInputModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule],

  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.scss'
})
export class PresentationComponent {
  private firestore: Firestore = inject(Firestore);
  teamId: string;
  presentationId: string;
  presentationUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (!teamId) throw new Error("Team ID is falsy");
    this.teamId = teamId;
    const presentationId = this.route.snapshot.paramMap.get('presentationId');
    if (!presentationId) throw new Error("Presentation ID is falsy");
    this.presentationId = presentationId;
    this.presentationUrl = `${window.location.origin}/checkup/${this.presentationId}`;
  }

  share() {
    if (navigator.share) {
      navigator.share({
        text: `Please complete reflectal checkup`,
        url: this.presentationUrl
      })
    }
  }

  finish() {
    getDocs(collection(this.firestore, 'presentations-in-progress', this.presentationId, 'responses'))
      .then((responses) => {
        const checkups = responses.docs.map((response) => { return response.data()['sentiment'] });
        updateDoc(doc(this.firestore, 'orgs', 'DEMO', 'teams', this.teamId, 'presentations', this.presentationId),
          {
            checkups: checkups,
            completed: new Date(),
          })
          .then(() => {
            deleteDoc(doc(this.firestore, 'presentations-in-progress', this.presentationId)).then(() => {
              this.router.navigate([`/team`, this.teamId]);
            });
          });
      });
  }
}
