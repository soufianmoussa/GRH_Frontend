import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteAnnuellesComponent } from './note-annuelles.component';

describe('NoteAnnuellesComponent', () => {
  let component: NoteAnnuellesComponent;
  let fixture: ComponentFixture<NoteAnnuellesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteAnnuellesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoteAnnuellesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
