import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore} from '@angular/fire/firestore';
import {User}  from './model/user';
import { Router }   from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  status$:Observable<boolean>;
  user:User;
  status:boolean;
  init:boolean; //has initiated the sign-in-check 
  check$; //only for components in need

  constructor(
    private router:Router,
    public Auth: AngularFireAuth,
    private db: AngularFirestore
    ){
      this.check$=this.Auth.user;
      this.status$=new Observable((obs)=>{
        let v=this.Auth.user.subscribe((user)=>{
          if(user) {
            let t=this.db.collection("users").doc(`${user.uid}`)
                  .valueChanges().subscribe((data)=>{
                    this.setStatus('online',user.uid);  
                    this.user=<User>data;
                    this.status=true;    
                    obs.next(true);
                });         
          }
          else {
             if(!this.init)
                this.router.navigate([{ outlets: { primary:'home',palet: null }}]); 
             this.user=null;
             this.status=false;      
             obs.next(false);   
          } 
          this.init=true;          
        });
        return {unsubscribe() {}};
      });
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
