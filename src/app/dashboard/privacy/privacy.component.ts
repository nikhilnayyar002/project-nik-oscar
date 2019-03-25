import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { AngularFirestore} from '@angular/fire/firestore';
import { SignInCheckService} from '../../sign-in-check.service';
import {User} from '../user';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class PrivacyComponent {
  saving;
  msg="";


  constructor(public auth:SignInCheckService,private db: AngularFirestore) {}
 
  ngOnInit(){
  }  
   
  save() {
  	if(this.auth.status) {
  	 this.saving=true;
	   this.msg="Saving changes...";
	   this.store();
  	}
  }

 store() {
	this.db.collection("users").doc(`${this.auth.user.uid}`).update(
    this.auth.user
	 )
	.then(()=> {
		this.msg="Save Sucess!";
	})
	.catch((error)=> {
    	this.msg=error.message;
    	this.saving=false;
  	});
 }

}

/*

  categories = [
    {
      id:'show_email',
      name: 'Show my email'
    },
    {
      show_about
      name: 'Show my "about" details'
    },
    {
      id:show_phone,
      name: 'Show my phone no.'
    },
    {
      id:,
      name: 'Show my image'
    },
    {
      id:,
      name: 'Show my background image'
    }
  ];
  myGroup;
  categoriesSelected=[true,true,true,true,true,true];

  constructor(private formBuilder: FormBuilder, private auth:SignInCheckService,private db: AngularFirestore) {}

    ngOnInit(){
    let t=0;
    for(let i in this.auth.user.privacy){
         this.categoriesSelected[t]=this.auth.user.privacy[i];
         ++t;
    }
    this.myGroup = this.formBuilder.group({
            myCategory: this.formBuilder.array(this.categoriesSelected)
    });
    this.myGroup.get('myCategory').setValue(this.categoriesSelected);
  }  
   
  save() {
    if(this.auth.status) {
     this.saving=true;
     this.msg="Saving changes...";
     this.store();
    }
  }

 store() {
  let t=0;
  let arr= this.myGroup.get('myCategory').value;
    for(let i in this.auth.user.privacy){
      this.auth.user.privacy[i]=arr[t];
        ++t;
    }

  */  