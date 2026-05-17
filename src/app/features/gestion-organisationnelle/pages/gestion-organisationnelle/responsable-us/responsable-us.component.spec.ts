import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsableUsComponent } from './responsable-us.component';

describe('ResponsableUsComponent', () => {
  let component: ResponsableUsComponent;
  let fixture: ComponentFixture<ResponsableUsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsableUsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponsableUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
