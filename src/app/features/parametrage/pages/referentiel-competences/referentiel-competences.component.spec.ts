import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferentielCompetencesComponent } from './referentiel-competences.component';

describe('ReferentielCompetencesComponent', () => {
  let component: ReferentielCompetencesComponent;
  let fixture: ComponentFixture<ReferentielCompetencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferentielCompetencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferentielCompetencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
