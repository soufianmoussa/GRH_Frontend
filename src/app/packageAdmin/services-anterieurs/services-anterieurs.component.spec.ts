import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesAnterieursComponent } from './services-anterieurs.component';

describe('ServicesAnterieursComponent', () => {
  let component: ServicesAnterieursComponent;
  let fixture: ComponentFixture<ServicesAnterieursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesAnterieursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesAnterieursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
