import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichierDesPrimesComponent } from './fichier-des-primes.component';

describe('FichierDesPrimesComponent', () => {
  let component: FichierDesPrimesComponent;
  let fixture: ComponentFixture<FichierDesPrimesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichierDesPrimesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FichierDesPrimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
