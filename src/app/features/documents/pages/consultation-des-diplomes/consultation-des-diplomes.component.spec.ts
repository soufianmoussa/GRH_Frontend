import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationDesDiplomesComponent } from './consultation-des-diplomes.component';

describe('ConsultationDesDiplomesComponent', () => {
  let component: ConsultationDesDiplomesComponent;
  let fixture: ComponentFixture<ConsultationDesDiplomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationDesDiplomesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationDesDiplomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
