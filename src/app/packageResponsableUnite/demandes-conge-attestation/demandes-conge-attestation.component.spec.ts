import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesCongeAttestationComponent } from './demandes-conge-attestation.component';

describe('DemandesCongeAttestationComponent', () => {
  let component: DemandesCongeAttestationComponent;
  let fixture: ComponentFixture<DemandesCongeAttestationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesCongeAttestationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandesCongeAttestationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
