import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsClientComponent } from './projects-client.component';

describe('ProjectsClientComponent', () => {
  let component: ProjectsClientComponent;
  let fixture: ComponentFixture<ProjectsClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
