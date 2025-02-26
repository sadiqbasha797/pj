import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarCreatorComponent } from './calendar-creator.component';

describe('CalendarCreatorComponent', () => {
  let component: CalendarCreatorComponent;
  let fixture: ComponentFixture<CalendarCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
