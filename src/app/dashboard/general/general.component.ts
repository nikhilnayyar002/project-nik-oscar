import { Component} from '@angular/core';
import{DomSanitizer,SafeStyle} from '@angular/platform-browser';
import { AngularFirestore} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { SignInCheckService} from '../../sign-in-check.service';
import { FormControl } from '@angular/forms';
import {User}  from '../user';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
export class GeneralComponent {
  file; file_BG;
  saving;
  image="";
  bgImage:SafeStyle|string="";
  bgSize='cover';
  bgY='0px'; bgY_old;
  msg="";
  edit=false;

  constructor(public auth:SignInCheckService,private db: AngularFirestore, private storage: AngularFireStorage,private sanitizer: DomSanitizer) {
        this.image=this.auth.user.image;
        let t=this.auth.user.bgImage?this.auth.user.bgImage:'assets/images/no-user.png';
        this.bgImage=this.sanitizer.bypassSecurityTrustStyle(`url(${t}) no-repeat center`);
        this.bgY=this.auth.user.bgY;
  }
/*
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
*/
  encodeImageFileAsURL(element,of) {
  	var fileTypes = ['jpg','jpeg', 'png'];
  	var file=element.target.files[0];
  	var reader = new FileReader();
  	if(!file) { this.msg="";}
  	else {
  			 var extension = file.name.split('.').pop().toLowerCase(); 
       		 var isSuccess = fileTypes.indexOf(extension) > -1;
			   if (isSuccess) {
  				reader.onloadend = ()=>{
              if(of=='main') {
                this.image=<string>reader.result;
                this.file=file;
              }
              else {
                this.bgImage=<string>reader.result;
                this.bgImage=this.sanitizer.bypassSecurityTrustStyle(`url(${this.bgImage}) no-repeat center`);
                this.bgSize='contain';setTimeout(()=>{this.bgSize='cover'},0);          
                this.file_BG=file;
              }
          };
  				reader.readAsDataURL(file);
  			 }
  		 	 else {this.msg="Select only img file"; }
  	}	
  }
  editBG() {
    this.edit=!this.edit;
    if(!this.edit) this.bgY_old=this.bgY;
  }

  moveBG(val) {
    let i=20;
    switch(val) {
      case 'u': this.bgY=(parseInt(this.bgY)-i)+'px'; break;
      case 'd': this.bgY=(parseInt(this.bgY)+i)+'px'; break;
    }
  }

  save() {
  	if(this.auth.status) {
  	 this.saving=true;
	   this.msg="Saving changes...(Images)";
	   if(this.file) {
    	let filePath =`user_img/${this.auth.user.uid}`;
    	let fileRef=this.storage.ref(filePath);
    	const task = this.storage.upload(filePath, this.file);
      let uploadPercent = task.percentageChanges().subscribe((value)=>{this.msg=`Saving changes...(User Image:${Math.round(value)}%)`;});      
    	task.snapshotChanges().pipe(finalize(()=>{
    		fileRef.getDownloadURL().subscribe((url)=>{
           uploadPercent.unsubscribe();       
			     this.auth.user.image=url;
           this.storeBG();        
    		});
    	})
   		,takeWhileAlive(this)).subscribe();
     }
     else this.storeBG();
  	}
  }

 storeBG() {
     if(this.file_BG) {
      let filePath =`user_img_bg/${this.auth.user.uid}`;
      let fileRef=this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.file_BG);
      let uploadPercent = task.percentageChanges().subscribe((value)=>{this.msg=`Saving changes...(Background Image:${Math.round(value)}%)`;}); 
      task.snapshotChanges().pipe(finalize(()=>{
        fileRef.getDownloadURL().subscribe((url)=>{  
           uploadPercent.unsubscribe();      
           this.auth.user.bgImage=url;           
           this.store();
        });
      })
      ,takeWhileAlive(this)).subscribe();
     }
     else this.store();
 }

 store() {
  this.msg="Saving changes...(user information)";
  if(this.bgY_old)  this.auth.user.bgY=this.bgY_old;
	this.db.collection("users").doc(`${this.auth.user.uid}`).update(
    this.auth.user
	 )
	.then(()=> {
    this.file=this.file_BG=null;
    this.saving=false;  
		this.msg="Save Sucess!";
	})
	.catch((error)=> {
    	this.msg=error.message;
    	this.saving=false;
  	});
 }

/*
 delete() {
  this.saving=true;
   this.msg="Deleting Ac...";
   let errorMsg='',Error=false;

   if(this.auth.user.bgImage) {
    this.msg="Deleting...(BgImage)"; 
    let filePath =`user_img_bg/${this.auth.user.uid}`;
    let fileRef=this.storage.ref(filePath);
    let t1=fileRef.delete().subscribe(()=>{

      if(this.auth.user.image) {
        this.msg="Deleting...(image)"; 
        let filePath =`user_img/${this.auth.user.uid}`;
        let fileRef=this.storage.ref(filePath);
        let t2=fileRef.delete().subscribe(()=>{
          del.bind(this)();
          t2.unsubscribe();
          },
          (error)=>{
           this.msg=error.message;
           this.saving=false;
        });
      }  
      else  del.bind(this)();
      t1.unsubscribe();

     },
     (error)=>{
         this.msg=error.message;
         this.saving=false;
     });
   }  
   else  del.bind(this)();

   function del();

  }
 */


}

