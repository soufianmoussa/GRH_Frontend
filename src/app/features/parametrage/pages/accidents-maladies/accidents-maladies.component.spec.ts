import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentsMaladiesComponent } from './accidents-maladies.component';

describe('AccidentsMaladiesComponent', () => {
  let component: AccidentsMaladiesComponent;
  let fixture: ComponentFixture<AccidentsMaladiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccidentsMaladiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccidentsMaladiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
