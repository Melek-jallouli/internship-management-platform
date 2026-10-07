import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncadrantDashboard } from './encadrant-dashboard';

describe('EncadrantDashboard', () => {
  let component: EncadrantDashboard;
  let fixture: ComponentFixture<EncadrantDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncadrantDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncadrantDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
