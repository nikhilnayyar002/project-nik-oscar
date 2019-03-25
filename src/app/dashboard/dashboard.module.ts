import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralComponent } from './general/general.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { OthersComponent } from './others/others.component';
import { ContainerComponent } from './container/container.component';
import  { DashboardRoutingModule } from './dashboard-routing.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule} from '@angular/forms';
import { MyModules } from '../my-modules';

@NgModule({
  declarations: [GeneralComponent, PrivacyComponent, OthersComponent, ContainerComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MyModules
  ]
})
export class DashboardModule { }
