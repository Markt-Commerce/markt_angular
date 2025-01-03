import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceHomepageComponent } from './marketplace-homepage.component';

describe('MarketplaceHomepageComponent', () => {
  let component: MarketplaceHomepageComponent;
  let fixture: ComponentFixture<MarketplaceHomepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketplaceHomepageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
