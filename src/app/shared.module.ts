import { SafeStylePipe } from './safe-style.pipe';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    SafeStylePipe
  ],
  exports:[
    SafeStylePipe
  ]
})
export class SharedModule { }
