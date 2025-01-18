import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarDeveloperComponent } from './sidebar-developer.component';

describe('SidebarDeveloperComponent', () => {
  let component: SidebarDeveloperComponent;
  let fixture: ComponentFixture<SidebarDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
