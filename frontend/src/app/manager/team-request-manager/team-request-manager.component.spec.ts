import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamRequestManagerComponent } from './team-request-manager.component';

describe('TeamRequestManagerComponent', () => {
  let component: TeamRequestManagerComponent;
  let fixture: ComponentFixture<TeamRequestManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamRequestManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamRequestManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
