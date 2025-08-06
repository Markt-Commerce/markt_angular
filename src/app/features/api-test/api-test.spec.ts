import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiTest } from './api-test';

describe('ApiTest', () => {
  let component: ApiTest;
  let fixture: ComponentFixture<ApiTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
