import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarDeveloperComponent } from './calendar-developer.component';

describe('CalendarDeveloperComponent', () => {
  let component: CalendarDeveloperComponent;
  let fixture: ComponentFixture<CalendarDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
