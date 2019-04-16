import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupNotifComponent } from './popup-notif.component';

describe('PopupNotifComponent', () => {
  let component: PopupNotifComponent;
  let fixture: ComponentFixture<PopupNotifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupNotifComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupNotifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
