import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriseEnChargeComponent } from './prise-en-charge.component';

describe('PriseEnChargeComponent', () => {
  let component: PriseEnChargeComponent;
  let fixture: ComponentFixture<PriseEnChargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriseEnChargeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriseEnChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
