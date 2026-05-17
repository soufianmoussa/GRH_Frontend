import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FammileEtEmploiComponent } from './fammile-et-emploi.component';

describe('FammileEtEmploiComponent', () => {
  let component: FammileEtEmploiComponent;
  let fixture: ComponentFixture<FammileEtEmploiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FammileEtEmploiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FammileEtEmploiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
