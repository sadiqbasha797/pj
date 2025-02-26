import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamRequestsComponent } from './team-requests.component';

describe('TeamRequestsComponent', () => {
  let component: TeamRequestsComponent;
  let fixture: ComponentFixture<TeamRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
