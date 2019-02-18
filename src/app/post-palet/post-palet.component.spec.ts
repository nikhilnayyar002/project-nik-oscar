import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPaletComponent } from './post-palet.component';

describe('PostPaletComponent', () => {
  let component: PostPaletComponent;
  let fixture: ComponentFixture<PostPaletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostPaletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostPaletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
