import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Convention } from './convention';

describe('Convention', () => {
  let component: Convention;
  let fixture: ComponentFixture<Convention>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Convention]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Convention);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
