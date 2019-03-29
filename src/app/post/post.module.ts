import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostRoutingModule } from './post-routing.module';
import { PostCardComponent } from './post-card/post-card.component';
import { PostDataComponent } from './post-data/post-data.component';
import { PostViewComponent } from './post-view/post-view.component';
import { PostPaginComponent } from './post-pagin/post-pagin.component';

@NgModule({
  declarations: [PostCardComponent, PostDataComponent, PostViewComponent, PostPaginComponent],
  imports: [
    CommonModule,
    PostRoutingModule
  ],
  exports:[PostViewComponent,PostCardComponent,PostDataComponent]
})
export class PostModule { }
