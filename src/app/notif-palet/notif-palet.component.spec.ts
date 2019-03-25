import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifPaletComponent } from './notif-palet.component';

describe('NotifPaletComponent', () => {
  let component: NotifPaletComponent;
  let fixture: ComponentFixture<NotifPaletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifPaletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifPaletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
