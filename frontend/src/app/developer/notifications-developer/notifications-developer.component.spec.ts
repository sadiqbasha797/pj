import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsDeveloperComponent } from './notifications-developer.component';

describe('NotificationsDeveloperComponent', () => {
  let component: NotificationsDeveloperComponent;
  let fixture: ComponentFixture<NotificationsDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
