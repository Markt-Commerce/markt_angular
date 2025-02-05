import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallSalesComponent } from './overall-sales.component';

describe('OverallSalesComponent', () => {
  let component: OverallSalesComponent;
  let fixture: ComponentFixture<OverallSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallSalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverallSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
