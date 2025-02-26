import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveCreatorComponent } from './leave-creator.component';

describe('LeaveCreatorComponent', () => {
  let component: LeaveCreatorComponent;
  let fixture: ComponentFixture<LeaveCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
