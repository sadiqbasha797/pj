import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsCreatorComponent } from './meetings-creator.component';

describe('MeetingsCreatorComponent', () => {
  let component: MeetingsCreatorComponent;
  let fixture: ComponentFixture<MeetingsCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingsCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingsCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
