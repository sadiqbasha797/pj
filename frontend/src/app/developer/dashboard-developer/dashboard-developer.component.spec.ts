import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDeveloperComponent } from './dashboard-developer.component';

describe('DashboardDeveloperComponent', () => {
  let component: DashboardDeveloperComponent;
  let fixture: ComponentFixture<DashboardDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
