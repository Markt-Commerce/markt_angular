import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EachSellerOrderComponent } from './each-seller-order.component';

describe('EachSellerOrderComponent', () => {
  let component: EachSellerOrderComponent;
  let fixture: ComponentFixture<EachSellerOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EachSellerOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EachSellerOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
