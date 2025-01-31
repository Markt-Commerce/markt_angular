import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDeskFaqsComponent } from './help-desk-faqs.component';

describe('HelpDeskFaqsComponent', () => {
  let component: HelpDeskFaqsComponent;
  let fixture: ComponentFixture<HelpDeskFaqsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpDeskFaqsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpDeskFaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
