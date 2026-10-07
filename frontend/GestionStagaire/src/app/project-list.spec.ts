import { TestBed } from '@angular/core/testing';

import { ProjectList } from './project-list';

describe('ProjectList', () => {
  let service: ProjectList;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectList);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
