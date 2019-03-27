import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './home/homepage/homepage.component';
import { PageNotFoundComponent } from './home/page-not-found/page-not-found.component';
import { PopupNotifComponent } from './home/popup-notif/popup-notif.component';
import { PopupPostComponent } from './home/popup-post/popup-post.component';
import { PopupLoginComponent } from './home/popup-login/popup-login.component';
import { PopupMessageComponent } from './home/popup-message/popup-message.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { TemplateModule } from './template/template.module';
import { InfoModule } from './info/info.module';
import { PostModule } from './post/post.module';
import { UploadModule } from './upload/upload.module';


import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule} from '@angular/forms';
import { FirestoreSettingsToken} from '@angular/fire/firestore';
import { ChatDirective } from './chat.directive';
import { ChatComponent } from './home/chat/chat.component';
import { ChatMessageComponent } from './home/chat-message/chat-message.component';
import { SafeStylePipe } from './safe-style.pipe';


@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    PageNotFoundComponent,
    PopupNotifComponent,
    PopupPostComponent,
    PopupLoginComponent,
    PopupMessageComponent,
    ChatDirective,
    ChatComponent,
    ChatMessageComponent,
    SafeStylePipe
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardModule,
    TemplateModule,
    InfoModule,
    PostModule,
    UploadModule,
    AppRoutingModule
  ],
  providers: [{ provide: FirestoreSettingsToken, useValue: {} }],
  bootstrap: [AppComponent]
})
export class AppModule { }
