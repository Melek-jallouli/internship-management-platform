import { TestBed } from '@angular/core/testing';

import { EntretienService } from './entretien.service';

describe('Entretien', () => {
  let service: EntretienService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntretienService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
