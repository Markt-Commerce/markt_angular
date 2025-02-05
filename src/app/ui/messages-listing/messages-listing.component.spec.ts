import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesListingComponent } from './messages-listing.component';

describe('MessagesListingComponent', () => {
  let component: MessagesListingComponent;
  let fixture: ComponentFixture<MessagesListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagesListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagesListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
