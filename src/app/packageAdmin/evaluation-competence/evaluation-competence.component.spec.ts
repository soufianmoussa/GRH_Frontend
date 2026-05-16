import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationCompetenceComponent } from './evaluation-competence.component';

describe('EvaluationCompetenceComponent', () => {
  let component: EvaluationCompetenceComponent;
  let fixture: ComponentFixture<EvaluationCompetenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationCompetenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationCompetenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
