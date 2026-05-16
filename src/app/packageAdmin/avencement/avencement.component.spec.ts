import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvencementComponent } from './avencement.component';

describe('AvencementComponent', () => {
  let component: AvencementComponent;
  let fixture: ComponentFixture<AvencementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvencementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvencementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
