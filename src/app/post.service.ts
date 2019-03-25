
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
export class PostService {

 users; prevPosts; chats; templates;
 postNotifFilter=(post:{is_posted:boolean; acess:string;})=>{return post.is_posted&&post.acess=='public';};

 constructor(private notify: NotifyService, private db: AngularFirestore, private auth:SignInCheckService) { 
    this.db.collection('users').valueChanges().subscribe((data)=>{
      this.users=data;
    });
    this.db.collection('chats').valueChanges().subscribe((data)=>{
      this.chats=data;
    });
    this.db.collection('created_templates').valueChanges().subscribe((data)=>{
      this.templates=data;
    });    
  } 

  templates$=this.db.collection('created_templates').valueChanges();

  posts$=new Observable((obs)=>{
    this.db.collection('posts').valueChanges().subscribe((data)=>{
      let rev=data.slice();
      obs.next(rev.reverse());
      if(this.prevPosts) 
        this.rtnChanged(this.prevPosts,data,this.postNotifFilter);
      this.prevPosts=data;
    });     
    return {unsubscribe() {}};
  });

  uploads$=new Observable((obs)=>{
    this.db.collection('uploads').valueChanges().subscribe((data)=>{
       obs.next(data.reverse());
    });    
    return {unsubscribe() {}};
  });

  users$=new Observable((obs)=>{
    this.db.collection('users').valueChanges().subscribe((data)=>{
      obs.next(data);
    });     
    return {unsubscribe() {}};
  });  

  chats$=new Observable((obs)=>{
    this.db.collection('chats').valueChanges().subscribe((data)=>{
      obs.next(data);
    });     
    return {unsubscribe() {}};
  }); 

  getAllPosts(func){ 
   if(func) return  this.posts$.pipe(map(func));
   else return  this.posts$;
  }

  getAllUploads(func){
   if(func) return this.uploads$.pipe(map(func));
   else return this.uploads$;
  }

  getAllTemplates(func){
   if(func) return this.templates$.pipe(map(func));
   else return this.templates$;
  }

 
  getUser(uid,func?) {
    type User={uid:string;image:string;privacy:{show_image:boolean;};name:string;};
    let defaultUserFilter=(uid,users:Array<User>)=> {
       const data:User=(users.filter((user:User) => user.uid==uid))[0];
       if(data.image && data.privacy.show_image) 
          return data;
       else  {
          data.image='';
          return data;
       }
    };
    if(this.users) {
        if(func) return func(uid,this.users);
        else return defaultUserFilter(uid,this.users);
    }
    return { image:"", name:"", uid:"", status:""};
  }

  getChat(id) {
    type Chat={name:string; id:string; uids:Array<{uid:string; status:string;}>;};
    let defaultChatFilter=(id,chats:Array<Chat>)=> {
       const data:Chat=(chats.filter((chat:Chat) =>chat.id==id))[0];
       return data;
    };

    if(this.chats) {
         return defaultChatFilter(id,this.chats);
    }
    return {uids:[], name:'...'};
  } 

  getTemplate(id) {
    let defaultFilter=(id,datas:any)=> {
       const data=(datas.filter((data) =>data.id==id))[0];
       return data;
    };

    if(this.templates) {
         return defaultFilter(id,this.templates);
    }
    return {name:'...',type:'',id:''};
  } 


  getComments(id) {
    let comments$=new Observable((obs)=>{
      let t=this.db.collection("posts").doc(id).collection("comments").valueChanges().subscribe((data)=>{
       obs.next(data.reverse());
      });     
      return {unsubscribe() {t.unsubscribe();}};
    });

    return comments$;
  }  

  rtnChanged(arr1,arr2,filter) {
    let i=0,j=0;
    while(j<arr2.length && i!=arr1.length) {
      while(arr2[j].id != arr1[i].id){
        ++i;
        if(i==arr1.length) break;
      }
      if(i==arr1.length) break;
      ++i;++j;
    } 
    while(j<arr2.length) {
      if(this.notify.working) continue;
      if(filter(arr2[j])) {
       this.notify.push({ link:`n${arr2[j].id}`,msg:`${arr2[j].title}`,viewed:false,title:`${arr2[j].iam}`,user:`${arr2[j].user_name}`,uid:`${arr2[j].user_id}`});
      }
      ++j;
    }
  }

  remove(type,uid) {
    let t;
    if(type=='chat_req_msgs')
      t=this.db.collection("users").doc(this.auth.user.uid).collection("others")
        .doc("make_friends").update({
            chats_req_rec: firebase.firestore.FieldValue.arrayRemove(uid)
      });
    else if(type=='conf_msgs') 
      t=this.db.collection("users").doc(this.auth.user.uid).collection("others")
        .doc("make_friends").update({
            friends_conf: firebase.firestore.FieldValue.arrayRemove(uid)
      });   
    else if(type=='req_msgs')
      t=this.db.collection("users").doc(this.auth.user.uid).collection("others")
        .doc("make_friends").update({
            friends_req_rec: firebase.firestore.FieldValue.arrayRemove(uid)
      });
    t.catch((error)=> {
          console.log("remove-from-notif: "+error.message);
    });
  }

}