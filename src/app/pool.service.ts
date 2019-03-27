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



@Injectable({
  providedIn: 'root'
})
export class PoolService {

 postNotifFilter=(post:Post):boolean => post.public;
 previousPosts:Array<Post>;
 orderByDescQuery=(ref:Query) => ref.orderBy('id','desc');
 
 users$:Observable<Array<User>>;
 templates$:Observable<Array<Template>>;
 groups$:Observable<Array<Group>>;
 uploads$:Observable<Array<Upload>>;
 posts$:Observable<Array<Post>>;
 discussions$:Observable<Array<Discussion>>;

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
  
  friendsObject$:Observable<Array<User>>; //array strings mapped to array users
  friends$:Observable<{datas:Array<string>}>; //array strings
  chats$:Observable<{datas:Array<string>}>; //array strings

  intialize(id:string) {
    this.friends$=this.db.collection("users").doc(this.auth.user.id)
    .collection("others").doc<{datas:Array<string>}>("friends").valueChanges();
    this.friendsObject$=this.friends$.pipe(
      map(data=>data.datas),
      mergeMap(datas=>
          combineLatest(
            datas.map(n=>this.users$.pipe(this.rtnDefaultUserFilter(n),map(users=>users[0]))
            )
          )
      )
    );
    this.chats$=this.db.collection("users").doc(this.auth.user.id)
    .collection("others").doc<{datas:Array<string>}>("chats").valueChanges();
  }
  
  rtnDefaultUserFilter(id:string) {
    let func=(users:Array<User>)=> users.filter(user=> 
          user.id==id && user.image && user.privacy.showImage
    );
    return map(func);
  }

  rtnDefaultIDFilter(id:string) {
    return map((datas:Array<{id:string;}>)=> datas.filter((data:{id:string;})=>data.id==id));
  }
   
  getComments(id:string) {
    return this.db.collection<Post>("posts").doc(id)
    .collection<Comment>("comments", this.orderByDescQuery).valueChanges();
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