import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateRoutingModule } from './template-routing.module';
import { DesignComponent } from './design/design.component';
import { MainComponent } from './main/main.component';
import { ViewComponent } from './view/view.component';

@NgModule({
  declarations: [DesignComponent, MainComponent, ViewComponent],
  imports: [
    CommonModule,
    FormsModule,
    TemplateRoutingModule
  ]
})
export class TemplateModule { }
