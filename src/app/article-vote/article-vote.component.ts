import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { Article } from '../models/presentation';

@Component({
  selector: 'app-article-vote',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './article-vote.component.html',
  styleUrl: './article-vote.component.scss'
})
export class ArticleVoteComponent {
  @Input({ required: true }) articles!: Article[];
  @Input() selectedArticle: number | undefined;
  @Output() vote = new EventEmitter<number>();

  selectArticle(article: number) {
    this.selectedArticle = article;
    this.vote.emit(this.selectedArticle);
  }
}
