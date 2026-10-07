import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagiaireTask } from './stagiaire-task';

describe('StagiaireTask', () => {
  let component: StagiaireTask;
  let fixture: ComponentFixture<StagiaireTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagiaireTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StagiaireTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
