import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniteStructurelleComponent } from './unite-structurelle.component';

describe('UniteStructurelleComponent', () => {
  let component: UniteStructurelleComponent;
  let fixture: ComponentFixture<UniteStructurelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniteStructurelleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniteStructurelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
