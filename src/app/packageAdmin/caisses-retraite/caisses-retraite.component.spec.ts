import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaissesRetraiteComponent } from './caisses-retraite.component';

describe('CaissesRetraiteComponent', () => {
  let component: CaissesRetraiteComponent;
  let fixture: ComponentFixture<CaissesRetraiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaissesRetraiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaissesRetraiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
