import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerBillingComponent } from './seller-billing.component';

describe('SellerBillingComponent', () => {
  let component: SellerBillingComponent;
  let fixture: ComponentFixture<SellerBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerBillingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
