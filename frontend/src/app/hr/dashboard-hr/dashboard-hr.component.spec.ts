import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardHrComponent } from './dashboard-hr.component';

describe('DashboardHrComponent', () => {
  let component: DashboardHrComponent;
  let fixture: ComponentFixture<DashboardHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
