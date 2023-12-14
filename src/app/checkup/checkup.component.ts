import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { Firestore, addDoc, collection, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-checkup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatInputModule, MatFormFieldModule, MatProgressBarModule, MatButtonToggleModule, MatIconModule, MatCardModule],
  templateUrl: './checkup.component.html',
  styleUrl: './checkup.component.scss'
})
export class CheckupComponent {
  private firestore: Firestore = inject(Firestore);
  teamId: string;
  checkupId: string;
  responseId: string | undefined;
  sentiment: number | undefined;

  constructor(
    private route: ActivatedRoute,
  ) {
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (!teamId) {
      throw new Error("Team ID is falsy");
    }
    this.teamId = teamId;
    const checkupId = this.route.snapshot.paramMap.get('checkupId');
    if (!checkupId) {
      throw new Error("Checkup ID is falsy");
    }
    this.checkupId = checkupId;
  }
  ChangeSentiment(sentiment: string) {
    this.sentiment = parseInt(sentiment);
    const response = {
      time: new Date(),
      sentiment: this.sentiment,
    };
    if (this.responseId) {
      updateDoc(doc(this.firestore, 'teams', this.teamId, 'checkups', this.checkupId, 'responses', this.responseId), response)
    } else {
      addDoc(collection(this.firestore, 'teams', this.teamId, 'checkups', this.checkupId, 'responses'), response)
        .then((responseRef) => {
          this.responseId = responseRef.id;
        });
    }
  }
}
