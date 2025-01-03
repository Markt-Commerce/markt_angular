import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashSaleProductListItemComponent } from './flash-sale-product-list-item.component';

describe('FlashSaleProductListItemComponent', () => {
  let component: FlashSaleProductListItemComponent;
  let fixture: ComponentFixture<FlashSaleProductListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashSaleProductListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashSaleProductListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
