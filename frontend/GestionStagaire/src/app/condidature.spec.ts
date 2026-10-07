import { TestBed } from '@angular/core/testing';

import { Condidature } from './condidature';

describe('Condidature', () => {
  let service: Condidature;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Condidature);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
