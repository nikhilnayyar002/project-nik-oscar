import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostRoutingModule } from './post-routing.module';
import { PostCardComponent } from './post-card/post-card.component';
import { PostDataComponent } from './post-data/post-data.component';
import { PostViewComponent } from './post-view/post-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PostService } from '../post.service';

@NgModule({
  declarations: [PostCardComponent, PostDataComponent, PostViewComponent],
  imports: [
    CommonModule,
    PostRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports:[PostViewComponent,PostCardComponent,PostDataComponent],
  providers:[PostService]
})
export class PostModule { }
