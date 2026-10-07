import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagiaireLayout } from './stagiaire-layout';

describe('StagiaireLayout', () => {
  let component: StagiaireLayout;
  let fixture: ComponentFixture<StagiaireLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagiaireLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StagiaireLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
