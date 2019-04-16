import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupUploadComponent } from './popup-upload.component';

describe('PopupUploadComponent', () => {
  let component: PopupUploadComponent;
  let fixture: ComponentFixture<PopupUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
