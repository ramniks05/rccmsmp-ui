import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MutationGiftSalesComponent } from './mutation-gift-sales.component';

describe('MutationGiftSalesComponent', () => {
  let component: MutationGiftSalesComponent;
  let fixture: ComponentFixture<MutationGiftSalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MutationGiftSalesComponent]
    });
    fixture = TestBed.createComponent(MutationGiftSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
