import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, take, finalize } from 'rxjs/operators';
import { AngularFirestore} from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { AuthService } from './auth.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Message } from './model/message';
import { Discussion } from './model/discussion';
import { Group } from './model/group';
import { User } from './model/user';
import { NotifType } from './shared/global';
import { promise } from 'protractor';
import { ChatComponent } from './home/chat/chat.component';

@Injectable({
  providedIn: ChatComponent
})
export class ChatService {

  constructor(
    private db: AngularFirestore,
    private auth:AuthService,
    private storage:AngularFireStorage
    )
  {  }  
  percent$:Observable<number>;

  sendMessage(messageType, chatType, currChat, file, dataID)
  :promise.Promise<any>|Observable<promise.Promise<any>> {

    let datet=new Date();  
    //create id
    let msgId=datet.getTime().toString().slice(-4)+this.auth.user.id.slice(0, 4);

    if(messageType=='blob' && file) {

       let type=chatType=='groups'?'chat':'discussion';
       let filePath =`${type}/${currChat.id}/${msgId}/${file.name}`;
       let fileRef=this.storage.ref(filePath);
       const task = this.storage.upload(filePath,file);
       this.percent$ = task.percentageChanges();

       return new Observable((obs)=>{
        try {
          task.snapshotChanges().pipe(finalize(()=>{  
            let g=fileRef.getDownloadURL().subscribe((url)=>{
             g.unsubscribe();
             obs.next(sendMsg.bind(this)(url,filePath));
            });
          }),take(1)).subscribe();         
        }
        catch(error){
           console.log(error.message);
        }
       });
    }
    else sendMsg.bind(this)(dataID?dataID:'','');

    function sendMsg(url,fileRef) {
      let msg:Message={
        userID:this.auth.user.id,
        userName:this.auth.user.name,
        date:datet,
        type:this.messageType, //'blob'|'post'|'upload'|'group'|'message'
        detail:this.message,
        data:url,
        id:msgId,
        fileRef:fileRef
      };
      return this.db.collection(this.chatType).doc(this.currChat.id)
      .collection("msgs").doc(msgId).set(msg);
    }  

  }

  
  createDiscussion(discussionTitle,currChat:Group):promise.Promise<void[]> {
    let datet=new Date();
    let discID=datet.getTime().toString().slice(-4)+this.auth.user.id.slice(0,4);
    let users=[];
    for(let i of currChat.users) {
      users.push(i.id);
    }
    let t1=this.db.collection('discussions').doc<Discussion>(discID).set({
      users:users,
      title:discussionTitle,
      groupID:currChat.id,
      id:discID,
      status:'open',
      date:datet
    }).catch((error)=> {
      console.log('createDiscussion1:'+error.message);
    })
    let t2=this.db.collection("chats").doc(currChat.id).update({
          discussions: firebase.firestore.FieldValue.arrayUnion(discID)
    }).catch((error)=> {
      console.log('createDiscussion2:'+error.message);
    })
    return promise.all([t1,t2]); 
  }

  createChat(
    currChat:Group, groupInfo:boolean, selectedUsers:Array<User>,
    bgFile:File, bgY:string, groupTitle:string
    ):promise.Promise<any>|Observable<promise.Promise<any>> {

    let users:Array<{id:string;status:string;}>=[], groupID:string, datet=new Date();
    if(!groupInfo) { //you are creating a group
     for(let i of selectedUsers) {
        users.push({id:i.id, status:'unconnected'});
     }
     users.push({id:this.auth.user.id, status:'connected'});
     groupID=datet.getTime().toString().slice(-4)+this.auth.user.id.slice(0,4);
    }
    else {
      groupID=currChat.id;
    }
    if(bgFile) { 
       let filePath:string;
       if(!groupInfo) filePath=`group/${groupID}/${bgFile.name}`;
       else filePath=currChat.fileRef;
       let fileRef=this.storage.ref(filePath);

       return new Observable((obs)=>{
        try {
          const task = this.storage.upload(filePath, bgFile);
          this.percent$ = task.percentageChanges(); 
            let t=task.snapshotChanges().pipe(finalize(()=>{
               fileRef.getDownloadURL().pipe(take(1)).subscribe((url)=>{
                obs.next(createReq.bind(this)(url,filePath));
               });
            }),take(1)).subscribe();
         }
         catch(error) {
           console.log('groupbgFile: '+error.message);
         }
       });

    }
    else createReq.bind(this)('','');

    function createReq(url,fileRef) {

    if(this.groupInfo && !url) url=currChat.image;  //same image as before
    if(!this.groupInfo) {
    
        let proms:Array<promise.Promise<any>>=[];
        proms.push(
          this.db.collection("chats").doc(groupID).set({ 
            users:users,    
            title:groupTitle,
            id:groupID,
            bgY:bgY,
            image:url,
            fileRef:fileRef,
            discussions:[],  
            date:datet
          }).catch((error)=> {
            console.log("chat-create():"+error.message);
          })
        );
        for(let i of users) 
          proms.push(
            this.db.collection("users").doc(i.id).collection("others").doc("make").update({
              datas: firebase.firestore.FieldValue.arrayUnion({
                type:NotifType.ChatRequest, id:groupID
              })
            }).catch((error)=> {
                console.log("chat-request("+i.id+'): '+error.message);
            })
          );   
        proms.push(
          this.db.collection("users").doc(this.auth.user.id).collection("others")
          .doc("chats").update({
             datas: firebase.firestore.FieldValue.arrayUnion(groupID)
          }).catch((error)=> {
            console.log("user-chat-save: "+error.message);
          })
        );

        return promise.all(proms); //return promise
    }
    else {  //return promise
        return this.db.collection("chats").doc(groupID).update({
          title:groupTitle,
          bgY:bgY,
          image:url,
        })
    }
    }
  }

  accept(chat) {
    let users=chat.users;
    let t,alreadyJoined,notFound=true;
    for(let i=0;i<users.length;++i) {
      if(users[i].id==this.auth.user.id) {
        if(users[i].status=='connected') alreadyJoined=true;
        users[i].status='connected';
        notFound=false;
        break;
      }
    }
    if(alreadyJoined) return;
    if(notFound) users.push({id:this.auth.user.id, status:'connected'});
    return this.db.collection("chats").doc(chat.id).update({
          users:users
    }).then(()=> {

        let t1;
        if(!notFound)
         t1=this.db.collection("users").doc(this.auth.user.id).collection("others").doc("make").update({
            chats_req_rec: firebase.firestore.FieldValue.arrayRemove(chat.id)
         })
         .catch((error)=> {
             console.log("chat-req-remove: "+error.message);
         });
        else t1=promise.fullyResolved('');

        let t2=this.db.collection("users").doc(this.auth.user.id).collection("others").doc("chats").update({
          datas: firebase.firestore.FieldValue.arrayUnion(chat.id)
        })
        .catch((error)=> {
            console.log("user-chats-update: "+error.message);
        });       

      return promise.all([t1,t2]);
    });

  }


 }









