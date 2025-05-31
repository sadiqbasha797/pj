import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveHrComponent } from './leave-hr.component';

describe('LeaveHrComponent', () => {
  let component: LeaveHrComponent;
  let fixture: ComponentFixture<LeaveHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveHrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
