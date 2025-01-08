import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticatedUserHeaderComponent } from './authenticated-user-header.component';

describe('AuthenticatedUserHeaderComponent', () => {
  let component: AuthenticatedUserHeaderComponent;
  let fixture: ComponentFixture<AuthenticatedUserHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticatedUserHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthenticatedUserHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
