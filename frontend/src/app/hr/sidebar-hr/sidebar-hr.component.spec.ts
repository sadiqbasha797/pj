import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarHrComponent } from './sidebar-hr.component';

describe('SidebarHrComponent', () => {
  let component: SidebarHrComponent;
  let fixture: ComponentFixture<SidebarHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarHrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
