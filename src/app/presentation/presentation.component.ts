import { Component, inject } from '@angular/core';
import { Firestore, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartEvent, ChartType } from 'chart.js';
import { PresentationResult } from '../models/presentation-result';

@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgChartsModule, MatInputModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule],

  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.scss'
})
export class PresentationComponent {
  private firestore: Firestore = inject(Firestore);
  teamId: string;
  presentationId: string;
  presentationUrl: string;
  presentation: PresentationResult = {} as PresentationResult;
  isLoading = true;

  pieChartType: ChartType = 'pie';
  chartLabels: string[] = [
    'Always',
    'Often',
    'Sometimes',
    'Rarely',
    'Never',
  ];

  public wellbeingChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [':))', ':)', ':(', ':(('],
    datasets: [{ data: [0, 0, 0, 0], },]
  };
  public q1ChartData: ChartData<'pie', number[], string | string[]> = {
    labels: this.chartLabels,
    datasets: [{ data: [0, 0, 0, 0, 0], },]
  };
  public q2ChartData: ChartData<'pie', number[], string | string[]> = {
    labels: this.chartLabels,
    datasets: [{ data: [0, 0, 0, 0, 0], },]
  };
  public q3ChartData: ChartData<'pie', number[], string | string[]> = {
    labels: this.chartLabels,
    datasets: [{ data: [0, 0, 0, 0, 0], },]
  };
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
    getDoc(doc(this.firestore, 'orgs', 'DEMO', 'teams', this.teamId, 'presentations', presentationId))
      .then((presentation) => {
        if (presentation.exists()) {
          this.presentation = presentation.data() as PresentationResult;
          this.presentation.created = presentation.data()['created'].toDate();
          this.presentation.finished = presentation.data()['finished'].toDate();
          this.presentation.wellbeing.forEach((response: number) => {
            this.wellbeingChartData.datasets[0].data[4 - response]++;
          });
          var dataset1 = [0, 0, 0, 0, 0];
          this.presentation.responses1.forEach((response: number) => {
            dataset1[5 - response]++;
          });
          this.q1ChartData.datasets[0].data = dataset1;
          const dataset2 = [0, 0, 0, 0, 0];
          this.presentation.responses2.forEach((response: number) => {
            dataset2[5 - response]++;
          });
          this.q2ChartData.datasets[0].data = dataset2;
          const dataset3 = [0, 0, 0, 0, 0];
          this.presentation.responses3.forEach((response: number) => {
            dataset3[5 - response]++;
          });
          this.q3ChartData.datasets[0].data = dataset3;
          this.isLoading = false;
        }
      })
  }

}
