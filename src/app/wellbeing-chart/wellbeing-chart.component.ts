import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { getDocs, collection, Firestore, query, orderBy } from '@angular/fire/firestore';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-wellbeing-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './wellbeing-chart.component.html',
  styleUrl: './wellbeing-chart.component.scss'
})
export class WellbeingChartComponent implements OnChanges {
  @Input({ required: true }) teamId!: string;
  private firestore: Firestore = inject(Firestore);
  lineChartType: ChartType = 'line';
  lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    }
  }
  lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Wellbeing' }]
  }
  isLoading = true;

  ngOnChanges(): void {
    const q = query(collection(this.firestore, 'orgs', 'DEMO', 'teams', this.teamId, 'presentations'),
      orderBy('created', 'asc'));
    getDocs(q)
      .then((presentations) => {
        presentations.docs.forEach((presentation) => {
          const scores = presentation.data()['wellbeing'];
          if (!scores) { return; }
          this.lineChartData.labels?.push(presentation.data()['created'].toDate().toDateString());
          const percentage = (scores.reduce((a: number, b: number) => a + b - 1, 0) / (3 * scores.length)) * 100;
          this.lineChartData.datasets[0].data.push(Math.round(percentage),);
        });
        this.isLoading = false;
      });
  }

}
