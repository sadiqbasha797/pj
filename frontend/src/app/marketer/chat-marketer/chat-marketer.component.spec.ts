import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMarketerComponent } from './chat-marketer.component';

describe('ChatMarketerComponent', () => {
  let component: ChatMarketerComponent;
  let fixture: ComponentFixture<ChatMarketerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMarketerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMarketerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
