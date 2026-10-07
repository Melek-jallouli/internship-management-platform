import { TestBed } from '@angular/core/testing';

import { CvDeploy } from './cv-deploy';

describe('CvDeploy', () => {
  let service: CvDeploy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CvDeploy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
