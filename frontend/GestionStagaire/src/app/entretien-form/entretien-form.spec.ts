import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntretienForm } from './entretien-form';

describe('EntretienForm', () => {
  let component: EntretienForm;
  let fixture: ComponentFixture<EntretienForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntretienForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntretienForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
