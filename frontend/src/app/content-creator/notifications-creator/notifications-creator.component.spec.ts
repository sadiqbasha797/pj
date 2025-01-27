import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsCreatorComponent } from './notifications-creator.component';

describe('NotificationsCreatorComponent', () => {
  let component: NotificationsCreatorComponent;
  let fixture: ComponentFixture<NotificationsCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
