import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsHrComponent } from './notifications-hr.component';

describe('NotificationsHrComponent', () => {
  let component: NotificationsHrComponent;
  let fixture: ComponentFixture<NotificationsHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsHrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
