import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiseEnDisponibiliteComponent } from './mise-en-disponibilite.component';

describe('MiseEnDisponibiliteComponent', () => {
  let component: MiseEnDisponibiliteComponent;
  let fixture: ComponentFixture<MiseEnDisponibiliteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiseEnDisponibiliteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiseEnDisponibiliteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
