import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarCreatorComponent } from './navbar-creator.component';

describe('NavbarCreatorComponent', () => {
  let component: NavbarCreatorComponent;
  let fixture: ComponentFixture<NavbarCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
