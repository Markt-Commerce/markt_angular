import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTabItemComponent } from './order-tab-item.component';

describe('OrderTabItemComponent', () => {
  let component: OrderTabItemComponent;
  let fixture: ComponentFixture<OrderTabItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTabItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTabItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
