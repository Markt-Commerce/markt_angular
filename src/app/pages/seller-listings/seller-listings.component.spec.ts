import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerListingsComponent } from './seller-listings.component';

describe('SellerListingsComponent', () => {
  let component: SellerListingsComponent;
  let fixture: ComponentFixture<SellerListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerListingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
