import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialisationMatriculesComponent } from './initialisation-matricules.component';

describe('InitialisationMatriculesComponent', () => {
  let component: InitialisationMatriculesComponent;
  let fixture: ComponentFixture<InitialisationMatriculesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialisationMatriculesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialisationMatriculesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
