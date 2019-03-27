import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AngularFirestore} from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { global, NotifType } from './shared/global';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FriendService {


  postNotifFilter=(post:{is_posted:boolean; acess:string;})=>{return post.is_posted&&post.acess=='public';};
  msg;
  friends$;
  make_friends$;
  constructor(
    private db: AngularFirestore,
    private auth:AuthService)
  {  }  

 //operation can be retried.
  request(id) {
    this.db.collection("users").doc(id).collection("others").doc("make").update({
        datas: firebase.firestore.FieldValue.arrayUnion({
            type:NotifType.FriendRequest, id:id
        })
    }) 
    .catch((error)=> {
        console.log(error.message);
    });
  }
  
   //operation can be retried.
  unRequest(id) {
    this.db.collection("users").doc(id).collection("others").doc("make").update({
      datas: firebase.firestore.FieldValue.arrayRemove({
        type:NotifType.FriendRequest, id:id
      })
    })  
    .catch((error)=> {
        console.log(error.message);
    });
  }

  //operation can be retried.
  accept(id) {
    this.msg="Accepting friend Request..";  
    let p1=this.db.collection("users").doc(this.auth.user.id).collection("others").doc("friends").update({
        datas: firebase.firestore.FieldValue.arrayUnion(id)
    });
    let p2=this.db.collection("users").doc(this.auth.user.id).collection("others").doc("make").update({
      datas: firebase.firestore.FieldValue.arrayUnion({
        type:NotifType.FriendConfirmed, id:id
      })
    }); 
    let p3=this.db.collection("users").doc(id).collection("others").doc("friends").update({
        datas: firebase.firestore.FieldValue.arrayUnion(this.auth.user.id)
    });
    let p4=this.db.collection("users").doc(id).collection("others").doc("make").update({
      datas: firebase.firestore.FieldValue.arrayRemove({
        type:NotifType.FriendRequest, id:id
      })
    });
    let p5=this.db.collection("users").doc(id).collection("others").doc("make").update({
      datas: firebase.firestore.FieldValue.arrayUnion({
        type:NotifType.FriendConfirmed, id:id
      })
    });      

    Promise.all([p4,p5,p3,p2,p1])
    .catch((error)=> {
      console.log(error.message);
    });
  }

   //operation can be retried.
  unFriend(id) {

    let p1=this.db.collection("users").doc(this.auth.user.id).collection("others").doc("friends").update({
      datas: firebase.firestore.FieldValue.arrayRemove(id)
    });
    let p2=this.db.collection("users").doc(this.auth.user.id).collection("others").doc("make").update({
      datas: firebase.firestore.FieldValue.arrayRemove({
       type:NotifType.FriendConfirmed, id:id
      })
    }); 
    let p3=this.db.collection("users").doc(id).collection("others").doc("friends").update({
      datas: firebase.firestore.FieldValue.arrayRemove(this.auth.user.id)
    });
    let p4=this.db.collection("users").doc(id).collection("others").doc("make").update({
      datas: firebase.firestore.FieldValue.arrayRemove({
        type:NotifType.FriendConfirmed, id:id
      })
    }); 

    Promise.all([p1,p2,p3,p4])
    .catch((error)=> {
      console.log(error.message);
    });
  }



 }









