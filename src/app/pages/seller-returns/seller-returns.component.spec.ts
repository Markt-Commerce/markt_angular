import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerReturnsComponent } from './seller-returns.component';

describe('SellerReturnsComponent', () => {
  let component: SellerReturnsComponent;
  let fixture: ComponentFixture<SellerReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerReturnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
