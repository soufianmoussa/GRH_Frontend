import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetachementComponent } from './detachement.component';

describe('DetachementComponent', () => {
  let component: DetachementComponent;
  let fixture: ComponentFixture<DetachementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetachementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetachementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
