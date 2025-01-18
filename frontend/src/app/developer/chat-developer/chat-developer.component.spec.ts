import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDeveloperComponent } from './chat-developer.component';

describe('ChatDeveloperComponent', () => {
  let component: ChatDeveloperComponent;
  let fixture: ComponentFixture<ChatDeveloperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatDeveloperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
