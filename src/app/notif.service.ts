import { Injectable } from '@angular/core';
import { Post } from './model/post';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Group } from './model/group';
import { User } from './model/user';
import { PoolService } from './pool.service';
import { global, NotifType } from './shared/global';

@Injectable({
  providedIn: 'root'
})
export class NotifService {

  postNotifFilter=(post:Post):boolean => post.isPublic;
  previousPosts:Array<Post>;

  constructor(
    private db:AngularFirestore,
    private ps:PoolService
  ){ 

    /* Notify about any new post */
    this.ps.posts$.subscribe((posts:Array<Post>)=> {
      posts.reverse();
      if(this.previousPosts) {
        let t=this.rtnChanged(this.previousPosts,posts);
        this.notifPosts(t,this.postNotifFilter);
      }      
      this.previousPosts=posts;
    });

  }

  initialize(uid:string) {
    this.userID=uid;
    this.subs=this.ps.makeString$.subscribe((data:{datas:Array<{id:string; type:string;}>;})=>{
      console.log(data)
      if(data) {
        this.makeBuffer=data.datas;
        this.clear(false);
        for(const i of data.datas) {
          let msg:NotifMessage=new NotifMessage(); 
          if(i.type!=NotifType.ChatRequest) {
            let subs=this.ps.getUserDoc(i.id).subscribe((user:User)=>{
              if(user) {
                msg.detail='from '+ user.name;
                msg.image=user.image;
                msg.link=global.userLink+user.id;
                msg.color='#FF5722';
                msg.data=user;
                msg.type=i.type;
                if(i.type==NotifType.FriendRequest) 
                  msg.heading="Friend Request";
                else  msg.heading=user.name + "is your friend now."; 
                this.push(msg,null); 
              }
              subs.unsubscribe();
            }); 
          }
          else {
            let filter=this.ps.rtnDefaultIDFilter(i.id);
            let subs=this.ps.groups$.pipe(filter).subscribe((groups:Array<Group>)=>{
              if(groups.length) {
                msg.detail=groups[0].title;
                msg.image=groups[0].image;
                msg.link=global.groupLink+groups[0].id;
                msg.color='red';
                msg.heading="Chat Request";
                this.push(msg,null);
              }
              subs.unsubscribe();
            });
          }
        }
      } 
    });
  }
  
  count=0;  //total messages in buffer
  working=false;
  otherMessages:Array<NotifMessage>=[];
  messages:Array<NotifMessage>=[];
  subs:Subscription;
  makeBuffer:Array<{id:string; type:string;}>;
  userID:string;

  push(msg:NotifMessage,type='message') {
    
    if(type!=NotifType.Post) {
     this.otherMessages.unshift(msg);
    }    
    else {
  	 this.messages.unshift(msg);
    }
    ++(this.count);
  }

  clear(clearAll=true) {
    if(!clearAll) {
      this.otherMessages=[];
      console.log('yo');
      return;
    }
    if(this.subs) this.subs.unsubscribe();
    this.count=0;
    this.otherMessages=[];
    this.messages=[];
  }

  viewed() {
    this.working=true;
    let t=0;
    for(let i in this.messages) {
      this.messages[i].color='#00000085';
    }
    this.count=0;
    this.working=false;    
  }

  notifPosts(posts:Array<Post>,filter:any) {
    let j=0;
    while(j<posts.length) {
      if(this.working) continue;
      if(filter(posts[j])) {
        let msg:NotifMessage=new NotifMessage();
        msg.heading="New Public Post";
        msg.detail=posts[j].title;
        msg.image=posts[j].image;
        msg.link=posts[j].data;
        msg.type=NotifType.Post;
        this.push(msg,NotifType.Post);
      }
      ++j;
    }
  }

  remove(id) {
    this.db.collection("users").doc(this.userID).collection("others")
    .doc("make").update({
        datas:this.makeBuffer.filter((data:{id:string; type:string;})=>data.id!=id)
      }).catch((error)=> {
          console.log("remove-from-notif: "+error.message);
    });
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

export class NotifMessage {
  heading:string;
  detail:string;
  image:string;
  link:string;
  color:string='#69ae19';
  data:any;
  type:string;
}

