import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sourcing } from './sourcing';

describe('Sourcing', () => {
  let component: Sourcing;
  let fixture: ComponentFixture<Sourcing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sourcing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sourcing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
