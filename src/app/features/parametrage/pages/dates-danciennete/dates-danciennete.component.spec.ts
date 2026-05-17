import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatesDancienneteComponent } from './dates-danciennete.component';

describe('DatesDancienneteComponent', () => {
  let component: DatesDancienneteComponent;
  let fixture: ComponentFixture<DatesDancienneteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatesDancienneteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatesDancienneteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
