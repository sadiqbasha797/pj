import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveDeveloperComponent } from './leave-developer.component';

describe('LeaveDeveloperComponent', () => {
  let component: LeaveDeveloperComponent;
  let fixture: ComponentFixture<LeaveDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
