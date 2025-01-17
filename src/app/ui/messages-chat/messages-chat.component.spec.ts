import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesChatComponent } from './messages-chat.component';

describe('MessagesChatComponent', () => {
  let component: MessagesChatComponent;
  let fixture: ComponentFixture<MessagesChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagesChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagesChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
