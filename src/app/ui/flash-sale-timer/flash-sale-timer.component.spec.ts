import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashSaleTimerComponent } from './flash-sale-timer.component';

describe('FlashSaleTimerComponent', () => {
  let component: FlashSaleTimerComponent;
  let fixture: ComponentFixture<FlashSaleTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashSaleTimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashSaleTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
