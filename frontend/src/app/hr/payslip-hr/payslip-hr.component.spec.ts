import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipHrComponent } from './payslip-hr.component';

describe('PayslipHrComponent', () => {
  let component: PayslipHrComponent;
  let fixture: ComponentFixture<PayslipHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayslipHrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayslipHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
