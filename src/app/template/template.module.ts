import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplateRoutingModule } from './template-routing.module';
import { IntroComponent } from './intro/intro.component';
import { DesignComponent } from './design/design.component';

@NgModule({
  declarations: [IntroComponent, DesignComponent],
  imports: [
    CommonModule,
    TemplateRoutingModule
  ]
})
export class TemplateModule { }
