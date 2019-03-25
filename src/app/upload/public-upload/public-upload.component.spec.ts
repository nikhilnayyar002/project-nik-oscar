import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicUploadComponent } from './public-upload.component';

describe('PublicUploadComponent', () => {
  let component: PublicUploadComponent;
  let fixture: ComponentFixture<PublicUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
