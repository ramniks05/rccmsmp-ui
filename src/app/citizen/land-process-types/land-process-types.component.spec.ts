import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandProcessTypesComponent } from './land-process-types.component';

describe('LandProcessTypesComponent', () => {
  let component: LandProcessTypesComponent;
  let fixture: ComponentFixture<LandProcessTypesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandProcessTypesComponent]
    });
    fixture = TestBed.createComponent(LandProcessTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
