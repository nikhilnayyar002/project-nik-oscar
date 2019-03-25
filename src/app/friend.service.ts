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
export class FriendService {


  postNotifFilter=(post:{is_posted:boolean; acess:string;})=>{return post.is_posted&&post.acess=='public';};
  msg;
  friends$;
  make_friends$;
  constructor(private notify: NotifyService, private db: AngularFirestore, private auth:SignInCheckService) { 
    let subs=this.auth.check.subscribe({
         next:(result)=>{
          if(result) {
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
          } 
         }
    });
  }  



  request(uid) {
    this.msg="Sending Request..";  
    this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("make_friends").update({
        friends_req: firebase.firestore.FieldValue.arrayUnion(uid)
    })
    .then(()=> {
     	this.db.collection("users").doc(uid).collection("others").doc("make_friends").update({
        friends_req_rec: firebase.firestore.FieldValue.arrayUnion(this.auth.user.uid)
    	})
    	.catch((error)=> {
        	this.msg=error.message;
        	//setTimeout(()=>{this.msg="Send Request";},1500);
    	});
    })    
    .then(()=> {
     	this.msg="Request Sent";
    })
    .catch((error)=> {
        this.msg=error.message;
        //setTimeout(()=>{this.msg="Send Request";},1500);
    });
  }
  
  unRequest(uid) {
    this.msg="Postponing Request..";  
    this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("make_friends").update({
        friends_req: firebase.firestore.FieldValue.arrayRemove(uid)
    })
    .then(()=> {
      this.db.collection("users").doc(uid).collection("others").doc("make_friends").update({
        friends_req_rec: firebase.firestore.FieldValue.arrayRemove(this.auth.user.uid)
      })
      .catch((error)=> {
          this.msg=error.message;
          //setTimeout(()=>{this.msg="Send Request";},1500);
      });
    })    
    .then(()=> {
      this.msg="Request Postponed.";
    })
    .catch((error)=> {
        this.msg=error.message;
        //setTimeout(()=>{this.msg="Send Request";},1500);
    });
  }


  accept(uid) {
    this.msg="Accepting friend Request..";  
    let p1=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("friends").update({
        datas: firebase.firestore.FieldValue.arrayUnion(uid)
    });
    let p2=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("make_friends").update({
        friends_req_rec: firebase.firestore.FieldValue.arrayRemove(uid),
        friends_conf: firebase.firestore.FieldValue.arrayUnion(uid),
    });  

    let p3=this.db.collection("users").doc(uid).collection("others").doc("friends").update({
        datas: firebase.firestore.FieldValue.arrayUnion(this.auth.user.uid)
    });
    let p4=this.db.collection("users").doc(uid).collection("others").doc("make_friends").update({
        friends_conf: firebase.firestore.FieldValue.arrayUnion(this.auth.user.uid),
        friends_req: firebase.firestore.FieldValue.arrayRemove(this.auth.user.uid)      
    });  

    Promise.all([p1,p2,p3,p4])
    .then(()=> {
      this.msg="Request accepted";
    })
    .catch((error)=> {
      this.msg=error.message;
      //setTimeout(()=>{this.msg=""Accept Request";},1500);
    });
  }

  unFriend(uid) {
    this.msg="Doing Un-friend Request..";
    let p1=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("friends").update({
        datas: firebase.firestore.FieldValue.arrayRemove(uid)
    });
    let p2=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("make_friends").update({
        friends_conf: firebase.firestore.FieldValue.arrayRemove(uid)
    });  
    let p3=this.db.collection("users").doc(uid).collection("others").doc("friends").update({
        datas: firebase.firestore.FieldValue.arrayRemove(this.auth.user.uid)
    });
    let p4=this.db.collection("users").doc(uid).collection("others").doc("make_friends").update({
        friends_conf: firebase.firestore.FieldValue.arrayRemove(this.auth.user.uid)     
    });  

    Promise.all([p1,p2,p3,p4])
    .then(()=> {
      this.msg="Un-friend Request done.";
    })
    .catch((error)=> {
      this.msg=error.message;
      //setTimeout(()=>{this.msg=""Accept Request";},1500);
    });
  }



 }









