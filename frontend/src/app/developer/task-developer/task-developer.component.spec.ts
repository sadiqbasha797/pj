import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDeveloperComponent } from './task-developer.component';

describe('TaskDeveloperComponent', () => {
  let component: TaskDeveloperComponent;
  let fixture: ComponentFixture<TaskDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
