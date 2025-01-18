import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsDeveloperComponent } from './projects-developer.component';

describe('ProjectsDeveloperComponent', () => {
  let component: ProjectsDeveloperComponent;
  let fixture: ComponentFixture<ProjectsDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
