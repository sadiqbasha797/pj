import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsMarketerComponent } from './meetings-marketer.component';

describe('MeetingsMarketerComponent', () => {
  let component: MeetingsMarketerComponent;
  let fixture: ComponentFixture<MeetingsMarketerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingsMarketerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingsMarketerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
