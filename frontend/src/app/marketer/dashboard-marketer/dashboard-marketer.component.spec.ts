import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMarketerComponent } from './dashboard-marketer.component';

describe('DashboardMarketerComponent', () => {
  let component: DashboardMarketerComponent;
  let fixture: ComponentFixture<DashboardMarketerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMarketerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMarketerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
