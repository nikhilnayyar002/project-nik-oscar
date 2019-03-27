
import { Component, OnInit , Input, ChangeDetectorRef} from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { AngularFirestore} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { SignInCheckService} from '../../sign-in-check.service';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import * as firebase from 'firebase/app';


@Component({
  selector: 'app-upload-data',
  templateUrl: './upload-data.component.html',
  styleUrls: ['./upload-data.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class UploadDataComponent implements OnInit {

  form=this.fb.group({
    dataType: ['link'], //link | file
    type:[{ext:'',id:'any'}], //file type
    detail:[''],  //upload detail
    acess:['public'], //acess

  })

  status; user;
  error=false;
  types=[];

  @Input() upload; edit=false; editTitle='close'; prevId; 
  fileSelec=false;//rescue

  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private auth:SignInCheckService,
    private cdr:ChangeDetectorRef,
    private fb:FormBuilder
  ) { }

  enable() {
     this.edit=!this.edit;
     let f = document.forms['upload'].getElementsByTagName('input');
     for (let i=0;i<f.length;++i)
         f[i].disabled=this.edit;
     f = document.forms['upload'].getElementsByTagName('textarea');
     f[0].disabled=this.edit;
     f = document.forms['upload'].getElementsByTagName('select');
     for (let i=0;i<f.length;++i)     
         f[i].disabled=this.edit;     
     if(this.edit) this.editTitle='edit'; 
     else this.editTitle='close';   
  }
  
  ngOnInit() {
    if(this.upload) {
      this.data_type.setValue(this.upload.data_type);
      this.acess.setValue(this.upload.acess);
      this.detail.setValue(this.upload.detail);
      this.type.setValue(this.upload.type);
      this.img=this.type.value.id=='image'?this.upload.data:'';
      this.link=this.upload.data_type=='link'?this.upload.data:'';
      this.title=this.upload.title;
      this.prevId=this.upload.id;
    }
    
    this.db.collection('files').valueChanges().pipe(takeWhileAlive(this)).subscribe((data)=>{
      this.types=data;
      const any = (data.filter((d:{id:string;}) => d.id=='any'))[0];
      this.type.setValue(any);
    });                 
  }  

  ngAfterViewInit() {
    if(this.upload) {  
      this.enable();
      this.cdr.detectChanges();
    }
  }

  ngOnChanges() {   //(changes: SimpleChanges)
    if(this.upload && this.prevId && this.prevId!=this.upload.id) {
      this.data_type.setValue(this.upload.data_type);
      this.acess.setValue(this.upload.acess);
      this.detail.setValue(this.upload.detail);
      this.type.setValue(this.upload.type);
      this.img=this.type.value.id=='image'?this.upload.data:'';
      this.link=this.upload.data_type=='link'?this.upload.data:'';
      this.title=this.upload.title;
      this.prevId=this.upload.id;   
      if(!this.edit) this.enable();   
    }
  }

  img=""; msg=""; uploading=false;
  title=""; link=""; file; id;


  encodeFile(element) {
    this.file = element.target.files[0];
    if(this.file) {
     this.title=this.file.name;
     let isSuccess,extension;
     if (!(this.type.value.id=='any')) {
      extension = this.file.name.split('.').pop().toLowerCase(); 
      isSuccess = this.type.value.ext.indexOf(extension) > -1;
     }
     if (isSuccess || this.type.value.id=='any') {
      this.msg="";
      let size=this.file.size;
      if(size > 1048576*10) {
        this.msg='file size exceeds 10MB';
        this.file=null;
        element.target.value=null;
      }
      if(this.type.value.id=='image' && this.file) {
        let reader = new FileReader();
        reader.onloadend = ()=>{this.img=<string>reader.result};
        reader.readAsDataURL(this.file);
      }
      else this.img='';
     }
     else {
      this.msg="Invalid file type selected.";
      this.file=null;
      if(this.upload) this.fileSelec=true;
     }
    }
  }

  paste(event:any) {
      let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
      let blob = null;

      for (let i = 0; i < items.length; i++) 
        if (items[i].type.indexOf("image") === 0) {
         blob = items[i].getAsFile();
         break;
        }
      if (blob !== null) {
        this.file=blob;
        let reader = new FileReader();
        reader.onload = (event:any)=> {
          this.img = event.target.result;
          this.title=(new Date).getTime()+'';        
        };
        reader.readAsDataURL(blob);
      }
  }

  fileTypeChanged() {
     this.msg="Please select your file again.";
     this.file=null;
     if(this.upload) this.fileSelec=true;
     this.img='';
  }

  uploadData() {
   this.uploading=true;
	 this.msg="Uploading...";
   let datet;
   if(this.upload) datet=this.upload.date.toDate();
   else datet=new Date();
	 if(this.data_type.value=='file') {
	  if(this.file) {
       this.msg="Uploading...(file)";       
    	 let filePath =`upload/${this.auth.user.uid}/${datet.getTime()}/${this.file.name}`;
    	 let fileRef=this.storage.ref(filePath);
    	 const task = this.storage.upload(filePath, this.file);
       let uploadPercent = task.percentageChanges().subscribe((value)=>{this.msg=`Uploading...(file:${Math.round(value)}%)`;});
    	 task.snapshotChanges().pipe(finalize(()=>{
    	    fileRef.getDownloadURL().pipe(takeWhileAlive(this)).subscribe((url)=>{
           uploadPercent.unsubscribe();
    		    this.store(url,datet);
    	     });
    	 }),takeWhileAlive(this)).subscribe();
     }
     else if(this.upload && !this.fileSelec) {  //this new var is necc. bcz you select a file type but you can then even upload in this case
       this.store(this.upload.data,datet);
     }
   	 else { 
      this.msg="No file selected to upload."; 
      this.uploading=false; return;
     }
   }
   else this.store(null,datet);	

  }

  store(url,datet) {

     if(!url && this.upload && this.upload.data_type=='file') {
      this.msg="Deleting...(file)";  
      let datet=this.upload.date.toDate();
      let filePath =`upload/${this.auth.user.uid}/${datet.getTime()}/${this.upload.file_name}`;
      let fileRef=this.storage.ref(filePath);
      let t1=fileRef.delete().subscribe(()=>{
          store2.bind(this)(url);
          t1.unsubscribe();
       },
       (error)=>{
         this.msg=error.message;
         this.uploading=false;
      });
     } 
     else store2.bind(this)(url);
  

   function store2(url)  {

    this.msg="Uploading...(upload info)";      
    if(!this.error) {
        this.id=`${datet.getTime()}`+this.auth.user.uid;
    } 
    this.db.collection("uploads").doc(this.id).set({
      id:this.id,
      iam:"upload",
      user_id:this.auth.user.uid,
      user_name:this.auth.user.name,
      date:datet,
      shared:this.upload?this.upload.shared:[],
      data_type:this.data_type.value,
      data:url?url:this.link,
      title: this.title?this.title:'no title',
      type:this.type.value,
      detail:this.detail.value,
      acess:this.acess.value,
      file_name:this.data_type.value=='file'?this.file.name:''
    })
    .then(()=> {
      if(!this.upload) {
        this.msg="Uploading...(user info)";         
        this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("uploads").update({
          datas: firebase.firestore.FieldValue.arrayUnion(this.id),
          names: firebase.firestore.FieldValue.arrayUnion(this.id.slice(0, 13)+'#'+ (this.title?this.title:'no title'))    
        })
        .then(()=> {
          this.msg="Upload Sucess!";
          this.uploading=false;
          this.error=false;          
        })
        .catch((error)=> {
          this.msg=error.message;
          this.uploading=false;
          this.error=true;
        });
      }
      else {      
          this.msg="Upload Sucess!";
          this.uploading=false;
          this.error=false;         
      }
    })
    .catch((error)=> {
      this.msg=error.message;
      this.uploading=false;
      this.error=true;
     });

    }

   }

  delete() {

   this.uploading=true;
   this.msg="Deleting...";
   let datet=this.upload.date.toDate();
   let errorMsg='',Error=false;

   this.msg="Deleting...(file)";  
   let filePath =`upload/${this.auth.user.uid}/${datet.getTime()}/${this.upload.file_name}`;
   let fileRef=this.storage.ref(filePath);
   if(this.upload.data_type=='file') {
      let t1=fileRef.delete().subscribe(()=>{
          del.bind(this)();
          t1.unsubscribe();
       },
       (error)=>{
         this.msg=error.message;
         this.uploading=false;
      });
   }  
   else  del.bind(this)();

   function del() {

      this.msg="Deleting...(users info)";
      let t2=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("uploads").update({
        datas: firebase.firestore.FieldValue.arrayRemove(this.upload.id),
        names: firebase.firestore.FieldValue.arrayRemove(this.upload.id.slice(0, 13)+'#'+this.upload.title)          
      })
      .then(()=> {
      }).catch((error)=> {
         errorMsg+=error.message+', '; Error=true;
      });

      this.msg="Deleting...(upload)";  
      let t3=this.db.collection("uploads").doc(this.upload.id).delete().then(()=>{
      }).catch((error)=>{
         errorMsg+=error.message+', '; Error=true;
      });

      Promise.all([t2,t3])
       .then(()=> {
          if(Error) {
            this.uploading=false;
            this.msg=errorMsg;
          }
          else this.msg="Deleted Sucess!";
       })
      .catch((error)=> {
          this.msg=error.message;
          this.uploading=false;          
      });
   }

  }

}

