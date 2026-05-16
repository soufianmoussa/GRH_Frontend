import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SituationActuelleComponent } from './situation-actuelle.component';

describe('SituationActuelleComponent', () => {
  let component: SituationActuelleComponent;
  let fixture: ComponentFixture<SituationActuelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SituationActuelleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SituationActuelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
