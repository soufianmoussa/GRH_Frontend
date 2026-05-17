import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationFormationsComponent } from './consultation-formations.component';

describe('ConsultationFormationsComponent', () => {
  let component: ConsultationFormationsComponent;
  let fixture: ComponentFixture<ConsultationFormationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationFormationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationFormationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
