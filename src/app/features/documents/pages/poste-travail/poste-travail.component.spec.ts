import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosteTravailComponent } from './poste-travail.component';

describe('PosteTravailComponent', () => {
  let component: PosteTravailComponent;
  let fixture: ComponentFixture<PosteTravailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosteTravailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosteTravailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
