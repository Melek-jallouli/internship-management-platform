import { TestBed } from '@angular/core/testing';

import { PfeStats } from './pfe-stats';

describe('PfeStats', () => {
  let service: PfeStats;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PfeStats);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
