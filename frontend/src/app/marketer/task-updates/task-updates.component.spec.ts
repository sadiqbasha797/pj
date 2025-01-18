import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskUpdatesComponent } from './task-updates.component';

describe('TaskUpdatesComponent', () => {
  let component: TaskUpdatesComponent;
  let fixture: ComponentFixture<TaskUpdatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskUpdatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
