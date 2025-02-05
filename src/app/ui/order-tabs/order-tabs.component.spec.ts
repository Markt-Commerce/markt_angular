import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTabsComponent } from './order-tabs.component';

describe('OrderTabsComponent', () => {
  let component: OrderTabsComponent;
  let fixture: ComponentFixture<OrderTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
