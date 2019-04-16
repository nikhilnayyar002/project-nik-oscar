import { Injectable } from '@angular/core';
import { Observable, of, from, Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore} from '@angular/fire/firestore';
import {User}  from './model/user';
import { Router }   from '@angular/router';
import * as firebase from 'firebase/app';
import { take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  status$:Observable<boolean>;
  user:User;
  userSubs:Subscription;
  status:boolean;
  init:boolean; //has initiated the sign-in-check 
  check$:Observable<firebase.User>; //only for components in need

  constructor(
    private router:Router,
    public Auth: AngularFireAuth,
    private db: AngularFirestore
    ){
      this.check$=this.Auth.user;
      this.status$=new Observable((obs)=>{
        let v=this.Auth.user.subscribe((user)=>{
          if(user) {
            let g=this.db.collection("users").doc<User>(`${user.uid}`).valueChanges();
            g.pipe(take(1)).subscribe((data)=>{
                this.setStatus('online',user.uid);  
                this.user=data;
                this.status=true;    
                obs.next(true);
            });
            this.userSubs=g.subscribe((data)=> {
                this.user=data;
            });
          }
          else {
             if(!this.init)
                this.router.navigate([{ outlets: { primary:'home',palet: null }}]);
             if(this.userSubs)  this.userSubs.unsubscribe();
             this.user=null;
             this.status=false;      
             obs.next(false);
          } 
          this.init=true;          
        });
        return {unsubscribe() {}};
      });
      this.status$.subscribe();
  }

  signIn(email,pass){
   return  from(this.Auth.auth.signInWithEmailAndPassword(email, pass));
  }


  signUp(email,pass){
   return from(this.Auth.auth.createUserWithEmailAndPassword(email, pass));
  }

  signOut(){
   return from(this.Auth.auth.signOut());
  }

  setStatus(status,uid='') {
    if(uid)
      this.db.collection("users").doc(uid).update({
        status:status
      }); 
  }

}
