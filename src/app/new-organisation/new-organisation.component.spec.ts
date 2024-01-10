import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrganisationComponent } from './new-organisation.component';

describe('NewOrganisationComponent', () => {
  let component: NewOrganisationComponent;
  let fixture: ComponentFixture<NewOrganisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewOrganisationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewOrganisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
