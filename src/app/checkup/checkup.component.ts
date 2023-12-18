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
import { Firestore, addDoc, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { QuestionComponent } from '../question/question.component';
import { Presentation } from '../models/presentation';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-checkup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, QuestionComponent, MatInputModule, MatFormFieldModule, MatProgressBarModule, MatButtonToggleModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './checkup.component.html',
  styleUrl: './checkup.component.scss'
})
export class CheckupComponent {
  private firestore: Firestore = inject(Firestore);
  presentation: Presentation = {} as Presentation;
  responseId: string | undefined;
  sentiment: string | undefined;
  questionNumber: number = 0;
  question: string = '';

  constructor(
    private route: ActivatedRoute,
  ) {
    const presentationId = this.route.snapshot.paramMap.get('presentationId');
    if (!presentationId) throw new Error("Presentation ID is falsy");
    getDoc(doc(this.firestore, 'presentations-in-progress', presentationId)).then((presentation) => {
      if (presentation.exists()) {
        this.presentation = presentation.data() as Presentation;
        this.presentation.id = presentationId;
      }
    })
  }

  async ChangeSentiment(sentiment: string) {
    this.sentiment = sentiment;
    if (this.responseId) {
      updateDoc(doc(this.firestore, 'presentations-in-progress', this.presentation.id, 'responses', this.responseId),
        { wellbeing: parseInt(this.sentiment) });
    } else {
      const responsesRef = collection(this.firestore, 'presentations-in-progress', this.presentation.id, 'responses');
      this.responseId = (await addDoc(responsesRef, {
        started: new Date(),
        wellbeing: parseInt(this.sentiment),
      })).id;
    }
  }

  NextQuestion(sentiment: any) {
    if (!this.responseId) { throw new Error("Response ID is falsy"); }

    this.question = this.presentation.questions[this.questionNumber];
    if (this.questionNumber > 0) {
      var responseData: { [key: string]: number } = {};
      responseData[`q${this.questionNumber}`] = parseInt(sentiment);
      updateDoc(doc(this.firestore, 'presentations-in-progress', this.presentation.id, 'responses', this.responseId), responseData);
    }
    this.questionNumber++;
    if (this.questionNumber >= 4) {
      updateDoc(doc(this.firestore, 'presentations-in-progress', this.presentation.id, 'responses', this.responseId),
        { completed: new Date() });
    }
  }

  reloadPage() {
    window.location.reload();
  }
}
