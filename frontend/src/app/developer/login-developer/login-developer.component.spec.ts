import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginDeveloperComponent } from './login-developer.component';

describe('LoginDeveloperComponent', () => {
  let component: LoginDeveloperComponent;
  let fixture: ComponentFixture<LoginDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
