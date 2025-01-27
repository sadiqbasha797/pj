import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingManagerComponent } from './marketing-manager.component';

describe('MarketingManagerComponent', () => {
  let component: MarketingManagerComponent;
  let fixture: ComponentFixture<MarketingManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketingManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketingManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
