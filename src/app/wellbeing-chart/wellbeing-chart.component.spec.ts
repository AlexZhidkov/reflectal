import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WellbeingChartComponent } from './wellbeing-chart.component';

describe('WellbeingChartComponent', () => {
  let component: WellbeingChartComponent;
  let fixture: ComponentFixture<WellbeingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WellbeingChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WellbeingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
