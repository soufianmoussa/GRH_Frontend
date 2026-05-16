import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataadministrativeComponent } from './dataadministrative.component';

describe('DataadministrativeComponent', () => {
  let component: DataadministrativeComponent;
  let fixture: ComponentFixture<DataadministrativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataadministrativeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataadministrativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
