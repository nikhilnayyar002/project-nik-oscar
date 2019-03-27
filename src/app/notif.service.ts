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

  constructor(
    private db:AngularFirestore,
    private ps:PoolService
  ){ 

  }

  initialize(uid:string) {
    this.userID=uid;
    this.subs=this.db.collection("users").doc(uid).collection("others").doc("make")
    .valueChanges().subscribe((data:{datas:Array<Map<string,string>>;})=>{
      if(data) {
        this.makeBuffer=data.datas;
        for(const i of data.datas) {
          this.clear(false);
          let msg:NotifMessage=new NotifMessage(); 
          if(i.get('type')!=NotifType.ChatRequest) {
            let filter=this.ps.rtnDefaultUserFilter(i.get('id'));
            let subs=this.ps.users$.pipe(filter).subscribe((users:Array<User>)=>{
              if(users.length) {
                msg.detail=users[0].name;
                msg.image=users[0].image;
                msg.link=global.userLink+users[0].id;
                msg.color='red';
                if(i.get('type')==NotifType.FriendReceived)
                  msg.heading="Friend Request";
                else  msg.heading="He is your friend now."; 
                this.push(msg,null);  
              }
              subs.unsubscribe();
            }); 
          }
          else {
            let filter=this.ps.rtnDefaultIDFilter(i.get('id'));
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
  
  destroy() {
    if(this.subs) this.subs.unsubscribe();
  }

  make$:Observable<{datas:Array<{id:string; type:string;}>;}>
  count=0;  //total messages in buffer
  working=false;
  otherMessages:Array<NotifMessage>;
  messages:Array<NotifMessage>;
  subs:Subscription;
  makeBuffer:Array<Map<string,string>>;
  userID:string;

  push(msg:NotifMessage,type='message') {
    if(type!='message') {
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
      return;
    }
    this.count=0;
    this.otherMessages=[];
    this.messages=[];
  }

  viewed() {
    this.working=true;
    let t=0;
    for(let i in this.messages) {
      this.messages[i].color='grey';
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
        this.push(msg,NotifType.Post);
      }
      ++j;
    }
  }

  remove(id) {
    this.db.collection("users").doc(this.userID).collection("others")
    .doc("make").update(
        this.makeBuffer.filter((data:Map<string,string>)=>data.get('id')!=id)
    ).catch((error)=> {
          console.log("remove-from-notif: "+error.message);
    });
  }

}

export class NotifMessage {
  heading:string;
  detail:string;
  image:string;
  link:string;
  color:string='green';
  datas$:Observable<Group | User>;
}


