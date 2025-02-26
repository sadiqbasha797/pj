import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveMarketerComponent } from './leave-marketer.component';

describe('LeaveMarketerComponent', () => {
  let component: LeaveMarketerComponent;
  let fixture: ComponentFixture<LeaveMarketerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveMarketerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveMarketerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
