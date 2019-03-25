import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashPaletComponent } from './dash-palet.component';

describe('DashPaletComponent', () => {
  let component: DashPaletComponent;
  let fixture: ComponentFixture<DashPaletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashPaletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashPaletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
