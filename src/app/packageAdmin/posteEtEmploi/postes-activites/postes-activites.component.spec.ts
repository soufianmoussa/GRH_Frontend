import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostesActivitesComponent } from './postes-activites.component';

describe('PostesActivitesComponent', () => {
  let component: PostesActivitesComponent;
  let fixture: ComponentFixture<PostesActivitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostesActivitesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostesActivitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
