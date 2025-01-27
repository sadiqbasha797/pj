import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatesManagerComponent } from './updates-manager.component';

describe('UpdatesManagerComponent', () => {
  let component: UpdatesManagerComponent;
  let fixture: ComponentFixture<UpdatesManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatesManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
