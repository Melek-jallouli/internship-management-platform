import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondidaturesComponent } from './condidature.component';

describe('Condidature', () => {
  let component: Condidature;
  let fixture: ComponentFixture<Condidature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Condidature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Condidature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
