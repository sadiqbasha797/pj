import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatesCreatorComponent } from './updates-creator.component';

describe('UpdatesCreatorComponent', () => {
  let component: UpdatesCreatorComponent;
  let fixture: ComponentFixture<UpdatesCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatesCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatesCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
