import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class SignInCheckService {

  status=new Observable((obs)=>{
    //this.Auth.auth.onAuthStateChanged((user)=>obs.next(user));

    this.Auth.user.subscribe((user)=>{
        obs.next(user)
    });
    
    return {unsubscribe() {}};
    }
  );
  
  constructor(public Auth: AngularFireAuth){}

  signIn(email,pass){
   return  from(this.Auth.auth.signInWithEmailAndPassword(email, pass));
  }


  signUp(email,pass){
   return from(this.Auth.auth.createUserWithEmailAndPassword(email, pass));
  }

  signOut(){
   return from(this.Auth.auth.signOut());
  }

}
