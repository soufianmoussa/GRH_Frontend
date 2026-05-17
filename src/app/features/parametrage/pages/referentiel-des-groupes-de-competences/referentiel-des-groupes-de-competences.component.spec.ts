import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferentielDesGroupesDeCompetencesComponent } from './referentiel-des-groupes-de-competences.component';

describe('ReferentielDesGroupesDeCompetencesComponent', () => {
  let component: ReferentielDesGroupesDeCompetencesComponent;
  let fixture: ComponentFixture<ReferentielDesGroupesDeCompetencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferentielDesGroupesDeCompetencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferentielDesGroupesDeCompetencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
