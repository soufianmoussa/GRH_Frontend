import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PretFinancierComponent } from './pret-financier.component';

describe('PretFinancierComponent', () => {
  let component: PretFinancierComponent;
  let fixture: ComponentFixture<PretFinancierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PretFinancierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PretFinancierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
