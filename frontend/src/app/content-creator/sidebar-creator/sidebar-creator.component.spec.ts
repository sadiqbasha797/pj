import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarCreatorComponent } from './sidebar-creator.component';

describe('SidebarCreatorComponent', () => {
  let component: SidebarCreatorComponent;
  let fixture: ComponentFixture<SidebarCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
