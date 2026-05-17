import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EchelleComponent } from './echelle.component';

describe('EchelleComponent', () => {
  let component: EchelleComponent;
  let fixture: ComponentFixture<EchelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EchelleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EchelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
