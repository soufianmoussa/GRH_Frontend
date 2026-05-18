import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueDesActesComponent } from './historique-des-actes.component';

describe('HistoriqueDesActesComponent', () => {
  let component: HistoriqueDesActesComponent;
  let fixture: ComponentFixture<HistoriqueDesActesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueDesActesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueDesActesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
