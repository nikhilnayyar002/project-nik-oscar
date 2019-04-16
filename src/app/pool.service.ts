import { Injectable } from '@angular/core';
import { Observable, of, from, combineLatest, defer } from 'rxjs';
import { AngularFirestore, Query} from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import {User} from './model/user';
import {Template} from './model/template';
import {Group} from './model/group';
import { Upload } from './model/upload';
import { Post } from './model/post';
import { AuthService } from './auth.service';
import { map, mergeMap } from 'rxjs/operators';
import { Discussion } from './model/discussion';
import { CommonObjectFeature } from './shared/global';
import { Comment } from './model/comment';

@Injectable({
  providedIn: 'root'
})
export class PoolService {


 orderByDescQuery=(ref:Query) => ref.orderBy('id','desc');
 isUserSignedIn=false;
 
 users$:Observable<Array<User>>;
 templates$:Observable<Array<Template>>;
 groups$:Observable<Array<Group>>;
 uploads$:Observable<Array<Upload>>;
 posts$:Observable<Array<Post>>;
 discussions$:Observable<Array<Discussion>>;
 comments$:Observable<Array<Comment>>;

 friendsString$:Observable<{datas:Array<string>}>; //user friend:array strings
 chatsString$:Observable<{datas:Array<string>}>; //user chat:array strings
 makeString$:Observable<{datas:Array<{id:string; type:string;}>;}>;

 friendsObject$:Observable<Array<User>>; //user friends:array strings mapped to array users
 postsObject$:Observable<Array<Post>>;  //user posts:array strings mapped to array posts
 uploadsObject$:Observable<Array<Upload>>;  //user uploads:array strings mapped to array uploads
 chatsObject$:Observable<Array<Group>>; //user groups:array strings mapped to array groups
 templatesObject$:Observable<Array<Template>>;  //user templates:array strings mapped to array templates

 constructor(
   private db: AngularFirestore,
   private auth: AuthService
   ) { 
  
    this.users$=defer(()=>this.db.collection<User>('users').valueChanges());
    this.templates$=defer(()=>this.db.collection<Template>('templates').valueChanges());
    this.groups$=defer(()=>this.db.collection<Group>('groups').valueChanges());
    this.uploads$=defer(()=>this.db.collection<Upload>('uploads',this.orderByDescQuery).valueChanges());
    this.posts$=defer(()=>this.db.collection<Post>('posts',this.orderByDescQuery).valueChanges());
    this.discussions$=defer(()=>this.db.collection<Discussion>("discussions").valueChanges());

  }

  intialize(id:string) {

    this.friendsString$=defer(()=>this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>}>("friends").valueChanges());

    this.chatsString$=defer(()=>this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>}>("chats").valueChanges());

    this.makeString$=defer(()=>this.db.collection("users").doc(id).collection("others")
    .doc<{datas:Array<{id:string; type:string;}>;}>("make").valueChanges());

    this.friendsObject$=this.getFriendsObject(id);
    this.uploadsObject$=this.getUploadsObject(id);
    this.postsObject$=this.getPostsObject(id);
    this.chatsObject$=this.getChatsObject(id);
    this.templatesObject$=this.getTemplatesObject(id);

    this.isUserSignedIn=true;
  }

  clear() {
    this.isUserSignedIn=false;

    this.friendsString$=null;
    this.chatsString$=null;
    this.makeString$=null;
    this.friendsObject$=null;
    this.uploadsObject$=null;
    this.postsObject$=null;
    this.chatsObject$=null;
    this.templatesObject$=null;
  }

  rtnDefaultIDFilter<T extends CommonObjectFeature>(id:string) {
    return map((datas:Array<T>)=> datas.filter((data)=>data.id==id));
  }
   
  getComments(id:string) {
    return this.db.collection("posts").doc(id)
    .collection<Comment>("comments", this.orderByDescQuery).valueChanges();
  }

  getMakeString(id:string) {
    return this.db.collection("users").doc(id).collection("others")
    .doc<{datas:Array<{id:string; type:string;}>;}>("make").valueChanges();
  }
  getUserDoc(id) {
    return this.db.collection("users").doc<User>(id).valueChanges();
  }

  getUploadsObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>;}>("uploads").valueChanges();
    
    let y=t.pipe(
      map(data=>data.datas.reverse()),
      mergeMap(datas=>
          combineLatest(
            datas.map(n=>this.uploads$.pipe(
                this.rtnDefaultIDFilter<Upload>(n),map(datas=>datas[0])
              )
            )
          )
      )
    );
    return defer(()=>y);
  }
  getPostsObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>;}>("posts").valueChanges();

    let y=t.pipe(
      map(data=>data.datas.reverse()),
      mergeMap(datas=>
          combineLatest(
            datas.map(n=>this.posts$.pipe(
                this.rtnDefaultIDFilter<Post>(n),map(datas=>datas[0])
              )
            )
          )
      )
    ); 
    return defer(()=>y);  
  }

  getChatsObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>;}>("chats").valueChanges();

    let y= t.pipe(
      map(data=>data.datas),
      mergeMap(datas=>
          combineLatest(
            datas.map(n=>this.groups$.pipe(
                this.rtnDefaultIDFilter<Group>(n),map(datas=>datas[0])
              )
            )
          )
      )
    );  
    return defer(()=>y); 
  }
  getTemplatesObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>;}>("templates").valueChanges();

    let y= t.pipe(
      map(data=>data.datas),
      mergeMap(datas=>
          combineLatest(
            datas.map(n=>this.templates$.pipe(
                this.rtnDefaultIDFilter<Template>(n),map(datas=>datas[0])
              )
            )
          )
      )
    );
    return defer(()=>y);
  }
  getFriendsObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>;}>("friends").valueChanges();

    let y= t.pipe(
      map(data=>data.datas),
      mergeMap(datas=>
          combineLatest(
            datas.map(n=>this.users$.pipe(this.rtnDefaultIDFilter(n),map(users=>users[0]))
            )
          )
      )
    ); 
    return defer(()=>y);   
  }

}
