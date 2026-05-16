import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistinctionsHonorifiquesComponent } from './distinctions-honorifiques.component';

describe('DistinctionsHonorifiquesComponent', () => {
  let component: DistinctionsHonorifiquesComponent;
  let fixture: ComponentFixture<DistinctionsHonorifiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistinctionsHonorifiquesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistinctionsHonorifiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
