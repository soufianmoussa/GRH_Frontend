import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttestationDeTravailComponent } from './attestation-de-travail.component';

describe('AttestationDeTravailComponent', () => {
  let component: AttestationDeTravailComponent;
  let fixture: ComponentFixture<AttestationDeTravailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttestationDeTravailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttestationDeTravailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
