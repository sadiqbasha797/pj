import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveManagerComponent } from './leave-manager.component';

describe('LeaveManagerComponent', () => {
  let component: LeaveManagerComponent;
  let fixture: ComponentFixture<LeaveManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
