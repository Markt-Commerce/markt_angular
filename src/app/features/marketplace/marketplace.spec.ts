import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Marketplace } from './marketplace';

describe('Marketplace', () => {
  let component: Marketplace;
  let fixture: ComponentFixture<Marketplace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Marketplace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Marketplace);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
