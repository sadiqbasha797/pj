import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatCreatorComponent } from './chat-creator.component';

describe('ChatCreatorComponent', () => {
  let component: ChatCreatorComponent;
  let fixture: ComponentFixture<ChatCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
