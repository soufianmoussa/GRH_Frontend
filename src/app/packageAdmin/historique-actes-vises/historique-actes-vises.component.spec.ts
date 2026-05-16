import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueActesVisesComponent } from './historique-actes-vises.component';

describe('HistoriqueActesVisesComponent', () => {
  let component: HistoriqueActesVisesComponent;
  let fixture: ComponentFixture<HistoriqueActesVisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueActesVisesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueActesVisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
