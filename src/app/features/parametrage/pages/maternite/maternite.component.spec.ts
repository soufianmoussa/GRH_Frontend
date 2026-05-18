import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterniteComponent } from './maternite.component';

describe('MaterniteComponent', () => {
  let component: MaterniteComponent;
  let fixture: ComponentFixture<MaterniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterniteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
