import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiationComponent } from './radiation.component';

describe('RadiationComponent', () => {
  let component: RadiationComponent;
  let fixture: ComponentFixture<RadiationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
