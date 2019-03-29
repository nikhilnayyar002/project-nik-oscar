import { Injectable } from '@angular/core';
import { Observable, of, from, combineLatest } from 'rxjs';
import { AngularFirestore, Query} from '@angular/fire/firestore';
import { NotifService} from './notif.service';
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

@Injectable({
  providedIn: 'root'
})
export class PoolService {

 postNotifFilter=(post:Post):boolean => post.isPublic;
 previousPosts:Array<Post>;
 orderByDescQuery=(ref:Query) => ref.orderBy('id','desc');
 
 users$:Observable<Array<User>>;
 templates$:Observable<Array<Template>>;
 groups$:Observable<Array<Group>>;
 uploads$:Observable<Array<Upload>>;
 posts$:Observable<Array<Post>>;
 discussions$:Observable<Array<Discussion>>;
 check$:Observable<firebase.User>;
 comments$:Observable<Array<Comment>>;

 friendsString$:Observable<{datas:Array<string>}>; //user friend:array strings
 chatsString$:Observable<{datas:Array<string>}>; //user chat:array strings
 makeString$:Observable<{datas:Array<Map<string,string>>;}>;

 friendsObject$:Observable<Array<User>>; //user friends:array strings mapped to array users
 postsObject$:Observable<Array<Post>>;  //user posts:array strings mapped to array posts
 uploadsObject$:Observable<Array<Upload>>;  //user uploads:array strings mapped to array uploads
 chatsObject$:Observable<Array<Group>>; //user groups:array strings mapped to array groups
 templatesObject$:Observable<Array<Template>>;  //user templates:array strings mapped to array templates

 constructor(
   private ns: NotifService,
   private db: AngularFirestore,
   private auth: AuthService
   ) { 
  
    this.users$=this.db.collection<User>('users').valueChanges();
    this.templates$=this.db.collection<Template>('templates').valueChanges();
    this.groups$=this.db.collection<Group>('groups').valueChanges();
    this.uploads$=this.db.collection<Upload>('uploads',this.orderByDescQuery).valueChanges();
    this.posts$=this.db.collection<Post>('posts',this.orderByDescQuery).valueChanges(); 
    this.discussions$=this.db.collection<Discussion>("discussions").valueChanges();
    this.check$=this.auth.check$;


    /* Notify about any new post */
    this.posts$.subscribe((posts:Array<Post>)=> {
      posts.reverse();
      if(this.previousPosts) {
        let t=this.rtnChanged(this.previousPosts,posts);
        this.ns.notifPosts(t,this.postNotifFilter);
      }
        
      this.previousPosts=posts;
    });

  }

  intialize(id:string) {

    this.friendsString$=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>}>("friends").valueChanges();

    this.chatsString$==this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>}>("chats").valueChanges();

    this.makeString$=this.db.collection("users").doc(id).collection("others")
    .doc<{datas:Array<Map<string,string>>;}>("make").valueChanges();

    this.friendsObject$=this.getFriendsObject(id);
    this.uploadsObject$=this.getUploadsObject(id);
    this.postsObject$=this.getPostsObject(id);
    this.chatsObject$=this.getChatsObject(id);
    this.templatesObject$=this.getTemplatesObject(id);
  }

  clear() {}

  rtnDefaultIDFilter<T extends CommonObjectFeature>(id:string) {
    return map((datas:Array<T>)=> datas.filter((data)=>data.id==id));
  }
   
  getComments(id:string) {
    return this.db.collection<Post>("posts").doc(id)
    .collection<Comment>("comments", this.orderByDescQuery).valueChanges();
  }

  getUploadsObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>}>("uploads").valueChanges();
    
    return t.pipe(
      map(data=>data.datas),
      mergeMap(datas=>
          combineLatest(
            datas.map(n=>this.uploads$.pipe(
                this.rtnDefaultIDFilter<Upload>(n),map(datas=>datas[0])
              )
            )
          )
      )
    );
  }

  getPostsObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>}>("posts").valueChanges();

    return t.pipe(
      map(data=>data.datas),
      mergeMap(datas=>
          combineLatest(
            datas.map(n=>this.posts$.pipe(
                this.rtnDefaultIDFilter<Post>(n),map(datas=>datas[0])
              )
            )
          )
      )
    );   
  }

  getChatsObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>}>("chats").valueChanges();

    return t.pipe(
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
  }
  getTemplatesObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>}>("templates").valueChanges();

    return t.pipe(
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
  }
  getFriendsObject(id:string) {
    let t=this.db.collection("users").doc(id)
    .collection("others").doc<{datas:Array<string>}>("friends").valueChanges();

    return t.pipe(
      map(data=>data.datas),
      mergeMap(datas=>
          combineLatest(
            datas.map(n=>this.users$.pipe(this.rtnDefaultIDFilter(n),map(users=>users[0]))
            )
          )
      )
    );    
  }

  /*
    detects changed data id Ex: (previousPosts,posts)
  */
  rtnChanged(arr1:Array<any>,arr2:Array<any>) {
    let i=0,j=0;
    outer: while(j<arr2.length && i!=arr1.length) {
      while(arr2[j].id != arr1[i].id){
        ++i;
        if(i==arr1.length) break outer;
      }
      ++i;++j;
    }
    return arr2.slice(j);
  }

}


/*

           this.friends$=new Observable((obs)=>{
               this.db.collection("users").doc(result.uid).collection("others").doc("friends").valueChanges().subscribe((data:{datas:[];})=>{
                 obs.next(data);
               });     
               return {unsubscribe() {}};
            });

            this.make_friends$=new Observable((obs)=>{
                 this.db.collection("users").doc(result.uid).collection("others").doc("make_friends").valueChanges().subscribe((data:{friends_req:[];friends_conf:[];friends_req_rec:[];})=>{
                  obs.next(data);
                 });     
                 return {unsubscribe() {}};
            });

*/