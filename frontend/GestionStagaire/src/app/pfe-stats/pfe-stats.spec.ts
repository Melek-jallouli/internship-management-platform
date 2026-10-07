import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfeStats } from './pfe-stats';

describe('PfeStats', () => {
  let component: PfeStats;
  let fixture: ComponentFixture<PfeStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PfeStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PfeStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
