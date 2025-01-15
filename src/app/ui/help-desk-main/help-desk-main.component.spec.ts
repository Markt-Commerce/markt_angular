import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDeskMainComponent } from './help-desk-main.component';

describe('HelpDeskMainComponent', () => {
  let component: HelpDeskMainComponent;
  let fixture: ComponentFixture<HelpDeskMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpDeskMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpDeskMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
