
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { LoginPaletComponent } from './login-palet/login-palet.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule} from '@angular/forms';
import { HomeComponent } from './home/home.component';
import  { DashboardModule } from './dashboard/dashboard.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FirestoreSettingsToken} from '@angular/fire/firestore';
import { NotifPaletComponent } from './notif-palet/notif-palet.component';
import { MyModules }  from './my-modules';
import { InfoModule} from './info/info.module';
import { DashPaletComponent } from './dash-palet/dash-palet.component';
import { ChatComponent } from './chat/chat.component';
import { ChatDirective } from './chat.directive';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { TemplateModule } from './template/template.module';

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, 
    AngularFireAuthModule, 
    AngularFireStorageModule,
    FormsModule,
    ReactiveFormsModule,
    MyModules,
    DashboardModule,
    InfoModule,
    TemplateModule,
    AppRoutingModule
  ],
  entryComponents: [ChatComponent],
  providers: [{ provide: FirestoreSettingsToken, useValue: {} }],
  declarations: [ AppComponent, LoginPaletComponent, HomeComponent, PageNotFoundComponent, NotifPaletComponent, DashPaletComponent, ChatComponent, ChatDirective, ChatMessageComponent],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
