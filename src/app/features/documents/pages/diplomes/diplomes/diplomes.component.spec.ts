import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiplomesComponent } from './diplomes.component';

describe('DiplomesComponent', () => {
  let component: DiplomesComponent;
  let fixture: ComponentFixture<DiplomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiplomesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiplomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
