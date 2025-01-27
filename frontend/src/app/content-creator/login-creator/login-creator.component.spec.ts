import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCreatorComponent } from './login-creator.component';

describe('LoginCreatorComponent', () => {
  let component: LoginCreatorComponent;
  let fixture: ComponentFixture<LoginCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
