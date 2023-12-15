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
  presentationId: string;
  responseId: string | undefined;
  sentiment: number | undefined;

  constructor(
    private route: ActivatedRoute,
  ) {
    const presentationId = this.route.snapshot.paramMap.get('presentationId');
    if (!presentationId) throw new Error("Presentation ID is falsy");
    this.presentationId = presentationId;
  }

  ChangeSentiment(sentiment: string) {
    this.sentiment = parseInt(sentiment);
    const response = {
      time: new Date(),
      sentiment: this.sentiment,
    };
    if (this.responseId) {
      updateDoc(doc(this.firestore, 'presentations-in-progress', this.presentationId, 'responses', this.responseId), response)
    } else {
      addDoc(collection(this.firestore, 'presentations-in-progress', this.presentationId, 'responses'), response)
        .then((responseRef) => {
          this.responseId = responseRef.id;
        });
    }
  }
}
