import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPaletComponent } from './login-palet.component';

describe('LoginPaletComponent', () => {
  let component: LoginPaletComponent;
  let fixture: ComponentFixture<LoginPaletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginPaletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPaletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
