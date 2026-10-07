import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncadrantLayout } from './encadrant-layout';

describe('EncadrantLayout', () => {
  let component: EncadrantLayout;
  let fixture: ComponentFixture<EncadrantLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncadrantLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncadrantLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
