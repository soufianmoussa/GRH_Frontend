import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesCompetencesComponent } from './mes-competences.component';

describe('MesCompetencesComponent', () => {
  let component: MesCompetencesComponent;
  let fixture: ComponentFixture<MesCompetencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesCompetencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesCompetencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
