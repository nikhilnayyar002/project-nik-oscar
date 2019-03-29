import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { Observable } from 'rxjs';
import { Post } from 'src/app/model/post';
import { Upload } from 'src/app/model/upload';
import { PoolService } from 'src/app/pool.service';
import { CommonObjectFeature } from 'src/app/shared/global';
import { Template } from 'src/app/model/template';
import { Group } from 'src/app/model/group';
import { User } from 'src/app/model/user';

@Component({
  selector: 'app-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.css']
})
export class MoreComponent {

  msg="";
  display="";

  postsObject$:Observable<Array<Post>>;  //user posts:array strings mapped to array posts
  uploadsObject$:Observable<Array<Upload>>;  //user uploads:array strings mapped to array uploads
  friendsObject$:Observable<Array<User>>; //user friends:array strings mapped to array users$
  chatsObject$:Observable<Array<Group>>; //user groups:array strings mapped to array groups
  templatesObject$:Observable<Array<Template>>;  //user templates:array strings mapped to array templates
  data$:Observable<CommonObjectFeature>;

  constructor(
    private ps:PoolService,
    private auth:AuthService,
    private db: AngularFirestore
    ) {
    this.postsObject$=this.ps.postsObject$.pipe(map(datas=>datas.reverse()));
    this.uploadsObject$=this.ps.uploadsObject$.pipe(map(datas=>datas.reverse()));
    this.friendsObject$=this.ps.friendsObject$;
    this.chatsObject$=this.ps.chatsObject$;
    this.templatesObject$=this.ps.templatesObject$;
  }
  
  select(name,id?) {

   if(name=='posts')
     this.data$=this.ps.uploads$.pipe(this.ps.rtnDefaultIDFilter(id),map(datas=>datas.length?datas[0]:null));

   else if(name=='uploads') 
     this.data$=this.ps.uploads$.pipe(this.ps.rtnDefaultIDFilter(id),map(datas=>datas.length?datas[0]:null));

   else if(name=='friends')
     this.data$=null;

  }
}

