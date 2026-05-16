import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SituationFamilleComponent } from './situation-famille.component';

describe('SituationFamilleComponent', () => {
  let component: SituationFamilleComponent;
  let fixture: ComponentFixture<SituationFamilleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SituationFamilleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SituationFamilleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
