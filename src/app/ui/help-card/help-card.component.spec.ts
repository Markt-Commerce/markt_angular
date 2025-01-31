import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpCardComponent } from './help-card.component';

describe('HelpCardComponent', () => {
  let component: HelpCardComponent;
  let fixture: ComponentFixture<HelpCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
