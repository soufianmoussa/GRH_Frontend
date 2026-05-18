import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CongeApprobationComponent } from './conge-approbation.component';

describe('CongeApprobationComponent', () => {
  let component: CongeApprobationComponent;
  let fixture: ComponentFixture<CongeApprobationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CongeApprobationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CongeApprobationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
