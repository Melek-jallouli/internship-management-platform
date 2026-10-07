import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvManagerComponent } from './cv-manager.component';

describe('CvManager', () => {
  let component: CvManagerComponent;
  let fixture: ComponentFixture<CvManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
