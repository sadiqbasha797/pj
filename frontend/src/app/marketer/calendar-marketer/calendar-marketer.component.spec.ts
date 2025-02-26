import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarMarketerComponent } from './calendar-marketer.component';

describe('CalendarMarketerComponent', () => {
  let component: CalendarMarketerComponent;
  let fixture: ComponentFixture<CalendarMarketerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarMarketerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarMarketerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
