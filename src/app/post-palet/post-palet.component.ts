import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AngularFirestore} from '@angular/fire/firestore';
import { PaletService } from '../palet.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { Router }                 from '@angular/router';


@Component({
  selector: 'app-post-palet',
  templateUrl: './post-palet.component.html',
  styleUrls: ['./post-palet.component.css']
})
export class PostPaletComponent implements OnInit {

  template = new FormControl('none');
  acess=new FormControl('public');
  type=new FormControl('general');
  detail=new FormControl('');


  templates=["none","standard"];
  types=["general","article"];

  constructor(private router:Router, private db: AngularFirestore, public palet: PaletService, private storage: AngularFireStorage) { }
  ngOnInit() {
  }

  img=""; msg=""; posting=false;
  title=""; link=""; file;

  encodeImageFileAsURL(element) {
  	var fileTypes = ['jpg','jpeg', 'png'];
  	this.file = element.target.files[0];
  	var file=this.file;
  	var reader = new FileReader();
  	if(!file) {this.img=''; this.msg="";}
  	else {
  			 var extension = file.name.split('.').pop().toLowerCase(); 
       		 var isSuccess = fileTypes.indexOf(extension) > -1;
			 if (isSuccess) {
  				reader.onloadend = ()=>{this.img=<string>reader.result};
  				reader.readAsDataURL(file);
  			 }
  		 	 else {this.msg="Select only img file"; }
  	}	
  }
  doPost(isPosted) {
  	this.posting=true;
	this.msg="Posting...";
	var filePath="";
	if(this.file) {
    	filePath =`posts/userid/${new Date().getTime()}`;
    	const task = this.storage.upload(filePath, this.file);
    	task.snapshotChanges().pipe(finalize(()=>{
    		store.bind(this)();
    	})
   		).subscribe();
    }
    else store.bind(this)();	

   	function store() {
			this.db.collection("posts").doc(`${new Date().getTime()}`).set({
    			iam:"post",
				user_id:null,
				date:new Date(),
				likes:0,
				acess:this.acess.value,
				shared:[],
				data_type: "link",
				data: this.link,
				title: this.title,
				type:this.type.value,
				is_posted:isPosted,
				image:filePath,
				detail:this.detail.value
			})
			.then(()=> {
				this.msg="Posted Sucess!";
				this.palet.isOpen=false;
				this.router.navigate([{ outlets: { palet: null  }}]);
			})
			.catch((error)=> {
    			this.msg=error.message;
    			this.posting=false;
  			});
  	}
  }
}
