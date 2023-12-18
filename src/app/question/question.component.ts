import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [FormsModule, MatButtonToggleModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionComponent {
  @Input({ required: true }) question!: string;
  @Output() nextQuestion = new EventEmitter<string>();
  sentiment: string | undefined;
}
