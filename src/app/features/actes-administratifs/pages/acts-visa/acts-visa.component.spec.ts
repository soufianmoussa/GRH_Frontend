import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActesVisaComponent } from './acts-visa.component';

describe('ActsVisaComponent', () => {
  let component: ActesVisaComponent;
  let fixture: ComponentFixture<ActesVisaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActesVisaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActesVisaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
