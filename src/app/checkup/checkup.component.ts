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
import { Firestore, addDoc, collection, collectionData, doc, docData, setDoc, updateDoc } from '@angular/fire/firestore';
import { QuestionComponent } from '../question/question.component';
import { Article, Presentation } from '../models/presentation';
import { MatButtonModule } from '@angular/material/button';
import { ArticleVoteComponent } from '../article-vote/article-vote.component';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-checkup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, QuestionComponent, ArticleVoteComponent, MatInputModule, MatFormFieldModule, MatProgressBarModule, MatButtonToggleModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './checkup.component.html',
  styleUrl: './checkup.component.scss'
})
export class CheckupComponent {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  presentation: Presentation = {} as Presentation;
  userId: string | undefined;
  sentiment: string | undefined;
  questionNumber: number = 0;
  question: string = '';
  articles: Article[] | undefined;

  constructor(
    private route: ActivatedRoute,
  ) {
    const presentationId = this.route.snapshot.paramMap.get('presentationId');
    if (!presentationId) throw new Error("Presentation ID is falsy");
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        console.error('User object is falsy');
        return;
      }
      this.userId = user.uid;

      docData(doc(this.firestore, 'presentations-in-progress', presentationId))
        .subscribe((presentation) => {
          if (presentation) {
            this.presentation = presentation as Presentation;
            this.presentation.id = presentationId;
            this.articles = this.presentation.articles;
          }
        });

      collectionData(collection(this.firestore, 'presentations-in-progress', presentationId, 'votes'))
        .subscribe((votes) => {
          if (this.articles) {
            for (let i = 0; i < this.articles.length; i++) {
              this.articles[i].votes = votes.filter((vote) => { return vote['articleIndex'] === i; }).length;
            }
          }
        });
    });
  }

  async ChangeSentiment(sentiment: string) {
    if (!this.userId) { throw new Error("User ID is falsy"); }
    this.sentiment = sentiment;
    setDoc(doc(this.firestore, 'presentations-in-progress', this.presentation.id, 'responses', this.userId), {
      started: new Date(),
      wellbeing: parseInt(this.sentiment),
    });
  }

  selectVote(voteEvent: any) {
    if (!this.userId) { throw new Error("User ID is falsy"); }
    const vote = parseInt(voteEvent);
    setDoc(doc(this.firestore, 'presentations-in-progress', this.presentation.id, 'votes', this.userId), { articleIndex: vote });
  }

  NextQuestion(sentiment: any) {
    if (!this.userId) { throw new Error("User ID is falsy"); }

    this.question = this.presentation.questions[this.questionNumber];
    if (this.questionNumber > 0) {
      var responseData: { [key: string]: number } = {};
      responseData[`q${this.questionNumber}`] = parseInt(sentiment);
      updateDoc(doc(this.firestore, 'presentations-in-progress', this.presentation.id, 'responses', this.userId), responseData);
    }
    this.questionNumber++;
    if (this.questionNumber >= 4) {
      updateDoc(doc(this.firestore, 'presentations-in-progress', this.presentation.id, 'responses', this.userId),
        { completed: new Date() });
    }
  }

  reloadPage() {
    window.location.reload();
  }
}
