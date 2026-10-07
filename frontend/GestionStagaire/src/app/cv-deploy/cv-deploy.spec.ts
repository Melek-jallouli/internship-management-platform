import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvDeploy } from './cv-deploy';

describe('CvDeploy', () => {
  let component: CvDeploy;
  let fixture: ComponentFixture<CvDeploy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvDeploy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvDeploy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
