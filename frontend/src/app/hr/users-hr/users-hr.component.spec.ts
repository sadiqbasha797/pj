import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersHrComponent } from './users-hr.component';

describe('UsersHrComponent', () => {
  let component: UsersHrComponent;
  let fixture: ComponentFixture<UsersHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersHrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
