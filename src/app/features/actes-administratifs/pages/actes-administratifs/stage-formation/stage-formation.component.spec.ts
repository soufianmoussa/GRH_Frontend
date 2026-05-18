import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageFormationComponent } from './stage-formation.component';

describe('StageFormationComponent', () => {
  let component: StageFormationComponent;
  let fixture: ComponentFixture<StageFormationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageFormationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StageFormationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
