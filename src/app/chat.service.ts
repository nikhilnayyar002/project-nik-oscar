import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore} from '@angular/fire/firestore';
import { SignInCheckService} from './sign-in-check.service';
import { NotifyService} from './notify.service';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private notify: NotifyService, private db: AngularFirestore, private auth:SignInCheckService) { 

  }  

  requestDisc(obj,currChat) {
    let discID=obj.id
    let users=[];
    for(let i=0;i<currChat.users.length;++i) {
      users.push(currChat.users[i].uid);
    }
    return this.db.collection('discussions').doc(discID).set({
          users:users,
          name:obj.title,
          chat_id:currChat.id,
          id:discID,
          status:'open'
        }).then(()=>{

          return this.db.collection("chats").doc(currChat.id).update({
            discussions: firebase.firestore.FieldValue.arrayUnion(discID)
          });

        })
  }

  request(uids:Array<string>,obj,cond) {
    let chatID=obj.id;
    if(!cond) {
        let users=[];
        for(let i=0;i<uids.length;++i) {
           users.push({uid:uids[i], status:'unconnected'});
        }
        users.push({uid:this.auth.user.uid, status:'connected'});
        return this.db.collection("chats").doc(chatID).set({
          users:users,
          name:obj.title,
          id:chatID,
          bgY:obj.bgY,
          image:obj.url,
          file_name:obj.file?obj.file.name:'',
          discussions:[],
          created:new Date()
        }).then(()=> {

          let proms=[];
          for(let i=0;i<uids.length;++i) {
            let t=this.db.collection("users").doc(uids[i]).collection("others").doc("make_friends").update({
             chats_req_rec: firebase.firestore.FieldValue.arrayUnion(chatID)
            })
            .catch((error)=> {
              console.log("chat-request: "+error.message);
            });
             proms.push(t);
          }
          let t=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("chats").update({
           datas: firebase.firestore.FieldValue.arrayUnion(chatID)
          });     
          proms.push(t);
          return Promise.all(proms);
        });
    }
    else {
        return this.db.collection("chats").doc(chatID).update({
          name:obj.title,
          bgY:obj.bgY,
          image:obj.url
        }).catch((error)=> {
              console.log("chat-update: "+error.message);
        });

    }

  }
  

  accept(chat) {
    let users=chat.users;
    let t,alreadyJoined,notFound=true;
    for(let i=0;i<users.length;++i) {
      if(users[i].uid==this.auth.user.uid) {
        if(users[i].status=='connected') alreadyJoined=true;
        users[i].status='connected';
        notFound=false;
        break;
      }
    }
    if(alreadyJoined) return;
    if(notFound) users.push({uid:this.auth.user.uid, status:'connected'});
    return this.db.collection("chats").doc(chat.id).update({
          users:users
    }).then(()=> {

        let t1;
        if(!notFound)
         t1=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("make_friends").update({
            chats_req_rec: firebase.firestore.FieldValue.arrayRemove(chat.id)
         })
         .catch((error)=> {
             console.log("chat-req-remove: "+error.message);
         });
        else t1=new Promise((resolve, reject) => resolve()); 

        let t2=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("chats").update({
          datas: firebase.firestore.FieldValue.arrayUnion(chat.id)
        })
        .catch((error)=> {
            console.log("user-chats-update: "+error.message);
        });       

      return Promise.all([t1,t2]);
    });

  }


 }









