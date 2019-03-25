import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostModule } from './post/post.module';
import { UploadModule } from './upload/upload.module';
import { PostPaletComponent } from './post-palet/post-palet.component';
@NgModule({
  imports: [
  	CommonModule,
  	FormsModule,
  	ReactiveFormsModule,
    PostModule,
    UploadModule
  ],
  declarations: [PostPaletComponent],
  exports:[PostModule,UploadModule]
})
export class  MyModules {}