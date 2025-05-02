import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerPricePlansComponent } from './seller-price-plans.component';

describe('SellerPricePlansComponent', () => {
  let component: SellerPricePlansComponent;
  let fixture: ComponentFixture<SellerPricePlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerPricePlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerPricePlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
