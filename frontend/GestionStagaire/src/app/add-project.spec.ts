import { TestBed } from '@angular/core/testing';

import { AddProject } from './add-project';

describe('AddProject', () => {
  let service: AddProject;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddProject);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
