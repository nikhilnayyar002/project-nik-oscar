import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { AngularFirestore} from '@angular/fire/firestore';
import {User}  from './dashboard/user';
import { Router }   from '@angular/router';

@Injectable({
  providedIn: 'root'
})
@AutoUnsubscribe()
export class SignInCheckService {

  status;
  user;
  check;
  status$;
  init;

  constructor(private router:Router, public Auth: AngularFireAuth, private db: AngularFirestore){
      this.check=new Observable((obs)=>{
        this.Auth.user.subscribe((user)=>{
          obs.next(user);
        });
        return {unsubscribe() {}};
      });
      this.status$=new Observable((obs)=>{
        let v=this.Auth.user.subscribe((user)=>{
          if(user) {
                let t=this.db.collection("users").doc(`${user.uid}`)
                .valueChanges().subscribe((data)=>{
                    this.user=<User>data;
                    obs.next(true);
                    t.unsubscribe();
                    v.unsubscribe();   
                });         
          }
          else {
             this.router.navigate([{ outlets: { primary:'home',palet: null }}]); 
             obs.next(false);   
          }           
        });
        return {unsubscribe() {}};
      });   
 
      this.check.pipe(takeWhileAlive(this)).subscribe({
          next:(user:{uid:string})=>{
                if(user) {
                 this.setStatus('online',user.uid);
                 this.db.collection("users").doc(`${user.uid}`)
                 .valueChanges().pipe(takeWhileAlive(this)).subscribe((data)=>{
                    this.user=<User>data;
                    this.status=true;         
                 });
                }
                else {               
                  this.user=null;
                  this.status=false;
                }
                this.init=true; 
          }
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


 /* 
  status=new Observable((obs)=>{
    //this.Auth.auth.onAuthStateChanged((user)=>obs.next(user));

    this.Auth.user.subscribe((user)=>{
        obs.next(user)
    });
    
    return {unsubscribe() {}};
    }
  );
  */

}
