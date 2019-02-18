import { Component} from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { SignInCheckService} from '../../sign-in-check.service';
import { FormControl } from '@angular/forms';
import {User} from './user';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})

export class GeneralComponent {
  file;
  saving;
  status;
  user={
     name:"",
     phone:"",
     about:"",
     image:"",
     uid:""
  };
  image="";
  msg="";

  constructor(private auth:SignInCheckService,private db: AngularFirestore, private storage: AngularFireStorage) {
    this.auth.status.subscribe({
   			 	next:(user:{uid:string})=>{
      				this.status=user?true:false;
                if(user)
                this.db.collection("users").doc(`${user.uid}`)
                .valueChanges().subscribe((data)=>{
                    this.user=<User>data;
                    this.image=this.user.image;
                    //if(this.user.image)
                        //this.toDataURL(this.user.image, (result)=>{this.image=result});
                });
                //else this.user=null;
          }
   		 });
  }

  toDataURL(url, callback) {
  	var xhr = new XMLHttpRequest();
  	xhr.onload = function() {
    	var reader = new FileReader();
    	reader.onloadend = function() {
      		callback(reader.result);
    	}
    	reader.readAsDataURL(xhr.response);
  	};
  	xhr.open('GET', url);
  	xhr.responseType = 'blob';
  	xhr.send();
  }

  encodeImageFileAsURL(element) {
  	var fileTypes = ['jpg','jpeg', 'png'];
  	this.file = element.target.files[0];
  	var file=this.file;
  	var reader = new FileReader();
  	if(!file) { this.msg="";}
  	else {
  			 var extension = file.name.split('.').pop().toLowerCase(); 
       		 var isSuccess = fileTypes.indexOf(extension) > -1;
			 if (isSuccess) {
  				reader.onloadend = ()=>{this.image=<string>reader.result};
  				reader.readAsDataURL(file);
  			 }
  		 	 else {this.msg="Select only img file"; }
  	}	
  }

  save() {
  	if(this.status) {
  	this.saving=true;
	this.msg="Saving changes...";

	if(this.file) {
    	let filePath =`user_img/${this.user.uid}`;
    	let fileRef=this.storage.ref(filePath);
    	const task = this.storage.upload(filePath, this.file);
    	task.snapshotChanges().pipe(finalize(()=>{
    		fileRef.getDownloadURL().subscribe((url)=>{
			     this.user.image=url;
    		   this.store();
    		});
    	})
   		).subscribe();
    }
    else this.store();
  	}
  }

  store() {
	this.db.collection("users").doc(`${this.user.uid}`).update(
    this.user
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

