import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfeList } from './pfe-list';

describe('PfeList', () => {
  let component: PfeList;
  let fixture: ComponentFixture<PfeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PfeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PfeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
