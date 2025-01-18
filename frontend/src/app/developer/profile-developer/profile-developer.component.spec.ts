import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDeveloperComponent } from './profile-developer.component';

describe('ProfileDeveloperComponent', () => {
  let component: ProfileDeveloperComponent;
  let fixture: ComponentFixture<ProfileDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
