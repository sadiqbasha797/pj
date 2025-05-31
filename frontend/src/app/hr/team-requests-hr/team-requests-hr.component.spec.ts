import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamRequestsHrComponent } from './team-requests-hr.component';

describe('TeamRequestsHrComponent', () => {
  let component: TeamRequestsHrComponent;
  let fixture: ComponentFixture<TeamRequestsHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamRequestsHrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamRequestsHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
