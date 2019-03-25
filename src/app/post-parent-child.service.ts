
import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs';
import { AngularFirestore} from '@angular/fire/firestore';
import { SignInCheckService} from './sign-in-check.service';

 
@Injectable({
  providedIn: 'root'
})
export class PostParentChildService {
 
  private childMessageSource = new Subject<Object>();
  childMessage$ = this.childMessageSource.asObservable();

  messageParent(msg: {}) {
    this.childMessageSource.next(msg);
  }

  subscription;

  constructor(private auth:SignInCheckService,private db: AngularFirestore) {

   this.subscription=this.childMessage$.subscribe( (msg:{ comment:string; like:boolean; value:string; post:{likes:string[]; id:string; comments_no:number;}}) => {

      if(msg.value=='like') {

        if(msg.like) 
          msg.post.likes.push(this.auth.user.uid);
        else
          msg.post.likes=msg.post.likes.filter((uid)=>{uid!=this.auth.user.uid}); 

          this.db.collection("posts").doc(msg.post.id).update(
             msg.post
          )
          .then(()=> {
            /*
             if(msg.like)
              this.auth.user.extra.likes_no+=1;
             else
              this.auth.user.extra.likes_no+=1;
             this.db.collection("users").doc(`${this.auth.user.uid}`).update(
                this.auth.user
              )
             .then(()=> {
               console.log("User updated");
              })
              .catch((error)=> {
                 console.log("User update failed");
                 this.auth.user.extra.likes_no-=1;
              });
            */
          })
          .catch((error)=> {
             console.log("Post update failed");
          });
      }
      if(msg.value=='comment') {


        let datet=new Date();
        let id=`${datet.getTime()}`+this.auth.user.uid;
     
        this.db.collection("posts").doc(msg.post.id).collection("comments").doc(id).set({
          id:id,
          comment:msg.comment,
          iam:"comment",
          user_id:this.auth.user.uid,
          user_name:this.auth.user.name,
          date:datet,
        })
        .then(()=> {
          msg.post.comments_no+=1;
          this.db.collection("posts").doc(msg.post.id).update(
             msg.post
          ) 
          .catch((error)=> {
             console.log(error.message);
             msg.post.comments_no-=1;
          });
        })
        .catch((error)=> {
             console.log(error.message);
        });

      }

    });  

  }	

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}