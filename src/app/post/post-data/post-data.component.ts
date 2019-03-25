import { Component, OnInit, Input, ChangeDetectorRef  } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AngularFirestore} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';
import { finalize } from 'rxjs/operators';
import { Router }  from '@angular/router';
import { SignInCheckService} from '../../sign-in-check.service';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { PostService} from '../../post.service';


@Component({
  selector: 'app-post-data',
  templateUrl: './post-data.component.html',
  styleUrls: ['./post-data.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class PostDataComponent implements OnInit {

  template = new FormControl('link');
  acess=new FormControl('public');
  detail=new FormControl('');
  error=false;
  templateUri='';
  selectedTemplateSubs;
  projectName='dynamo-t';

  @Input() post; edit=false; editTitle='close'; prevId; 

  enable() {
     this.edit=!this.edit;
     let f = document.forms['post'].getElementsByTagName('input');
     for (let i=0;i<f.length;++i)
         f[i].disabled=this.edit;
     f = document.forms['post'].getElementsByTagName('textarea');
     f[0].disabled=this.edit;
     f = document.forms['post'].getElementsByTagName('select');
     for (let i=0;i<f.length;++i)     
         f[i].disabled=this.edit;     
     if(this.edit) this.editTitle='edit'; 
     else this.editTitle='close';   
  }

  fileTypes=['jpg','jpeg', 'png'];

  constructor(
    private router:Router,
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private auth:SignInCheckService,
    private cdr:ChangeDetectorRef,
    private ps:PostService
    ) { 

  }
  
  ngOnInit() {
    if(this.post) {
      this.template.setValue(this.post.data_type);
      this.acess.setValue(this.post.acess);
      this.detail.setValue(this.post.detail);
      this.img=this.post.image;
      this.link=this.post.data;     
      this.title=this.post.title;
      this.prevId=this.post.id;
      this.templateUri=this.post.templateUri;
    }

    let t=this.db.doc(`files/image`).valueChanges().pipe(takeWhileAlive(this)).subscribe((data:{ext:[]})=>{
            this.fileTypes=data.ext;  t.unsubscribe();
    });                  
  }  
  ngAfterViewInit() {
   if(this.post) {
    this.enable();
    this.cdr.detectChanges();
   }
  }
  ngOnChanges() {   //(changes: SimpleChanges)
    if(this.post && this.prevId && this.prevId!=this.post.id) {
      this.template.setValue(this.post.data_type);
      this.acess.setValue(this.post.acess);
      this.detail.setValue(this.post.detail);
      this.img=this.post.image;
      this.link=this.post.data;     
      this.title=this.post.title;
      this.prevId=this.post.id;
      this.templateUri=this.post.templateUri;   
      if(!this.edit) this.enable();   
    }
  }

  img=""; msg=""; posting=false;
  title=""; link=""; file;

 
 encodeImageFileAsURL(element) {
    this.file = element.target.files[0];
    if(this.file) {
     let isSuccess,extension;
     extension = this.file.name.split('.').pop().toLowerCase(); 
     isSuccess = this.fileTypes.indexOf(extension) > -1;
     if (isSuccess) {
      this.msg="";
      let reader = new FileReader();
      reader.onloadend = ()=>{this.img=<string>reader.result};
      reader.readAsDataURL(this.file);
     }
     else {
      this.img='';
      this.msg="Invalid img file selected.";
     }
    }
  }

 paste(event:any) {
      let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
      let blob = null;
      if (items[0].type.indexOf("image") === 0) {
         blob = items[0].getAsFile();
         if (blob !== null) {
           this.file=blob;   
           let reader = new FileReader();
           reader.onload = (event:any)=> {
             this.img = event.target.result;    
           };
           reader.readAsDataURL(blob);
         }
      }
      else {
          setTimeout(()=>{ 
            this.img=event.target.value;
            this.file=null;
          },0);
      }
 }

 pasteTemplate(event){
      //so that to rerieve what was pasted after one click
          setTimeout(()=>{  
            let t=event.target.value;
            if(t==this.templateUri || this.template.value=='link') return;
            function func(datas:Array<{id:string;}>) {
                return datas.filter((data)=>data.id==t);
            }             
            if(this.selectedTemplateSubs) 
              this.selectedTemplateSubs.unsubscribe();
            this.selectedTemplateSubs
              =this.ps.getAllTemplates(func).subscribe({next:(datas:any)=>{
                if(datas.length) {
                  let t=datas[0].title.replace(/ /gi, '-');
                  t+='-'+datas[0].id;
                  t='/template/view/'+t;
                  this.templateUri=t;
                  this.link=datas[0].id; //!important
                }
                else 
                  this.templateUri='';
                this.selectedTemplateSubs.unsubscribe();
            }});
          },0);
  }

  doPost(isPosted) {
   this.posting=true;
   this.msg="Posting...";
   let datet,template;
   if(this.post) datet=this.post.date.toDate();
   else datet=new Date();

   if(this.template.value=='template'&& !this.templateUri) {
      this.msg='Invalid Template ID! Paste again.';
      this.posting=false;
      return;
   }
   if(this.file) {
       this.msg="Posting...(Image)";   
       let filePath =`posts/${this.auth.user.uid}/${datet.getTime()}`;
       let fileRef=this.storage.ref(filePath);
       const task = this.storage.upload(filePath, this.file);
       let uploadPercent = task.percentageChanges().subscribe((value)=>{this.msg=`Posting...(Image:${Math.round(value)}%)`;});       
       task.snapshotChanges().pipe(finalize(()=>{
          fileRef.getDownloadURL().pipe(takeWhileAlive(this)).subscribe((url)=>{
             uploadPercent.unsubscribe();
             store.bind(this)(url);
          });
       }),takeWhileAlive(this)).subscribe();
   }
   else if(this.post && !this.img.includes(this.projectName+'.appspot.com')) {
      if(this.post.image.includes(this.projectName+'.appspot.com')) {
        let filePath =`posts/${this.auth.user.uid}/${datet.getTime()}`;
        let fileRef=this.storage.ref(filePath);
        let t1=fileRef.delete().subscribe(()=>{
          t1.unsubscribe();
          store.bind(this)();
        },
        (error)=>{
         this.msg=error.message;
         this.posting=false;
        });
      }
      else store.bind(this)();
   }
   else store.bind(this)(); 

   function store(url) {

    this.msg="Posting...(post info)";     
    let data;
    if(!this.error) {
        this.id=`${datet.getTime()}`+this.auth.user.uid;
    }
    this.db.collection("posts").doc(this.id).set({
        id:this.id,
        likes:this.post?this.post.likes:[],
        comments_no:this.post?this.post.comments_no:0,
        iam:"post",
        user_id:this.auth.user.uid,
        user_name:this.auth.user.name,
        date:datet,
        acess:this.acess.value,
        shared:this.post?this.post.shared:[],
        data_type:this.template.value,
        data:this.link,
        templateUri:this.templateUri,
        title: this.title?this.title:'no title',
        is_posted:isPosted,
        image:url?url:this.img,
        detail:this.detail.value
    })
    .then(()=> {
      if(!this.post) {
        this.msg="Posting...(user info)";         
        this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("posts").update({
          datas: firebase.firestore.FieldValue.arrayUnion(this.id),
          names: firebase.firestore.FieldValue.arrayUnion(this.id.slice(0, 13)+'#'+ (this.title?this.title:'no title'))          
        })
        .then(()=> {
          this.msg="Posted Sucess!";
          this.router.navigate([{ outlets: { palet: null  }}]);
        })
        .catch((error)=> {
          console.log("inner error");
          this.msg=error.message;
          this.posting=false;
          this.error=true;
        });
      }
      else {
          this.msg="Posted Sucess!";
          this.posting=false;
          this.error=false;
      }
    })
    .catch((error)=> {
      console.log("outer error");
      this.msg=error.message;
      this.posting=false;
      this.error=true;
    });
   }
  }

  delete() {

   this.posting=true;
   this.msg="Deleting...";
   let datet=this.post.date.toDate();
   let errorMsg='',Error=false;

   this.msg="Deleting...(Image)";
   let filePath =`posts/${this.auth.user.uid}/${datet.getTime()}`;
   let fileRef=this.storage.ref(filePath);

   if(this.post.image.includes(this.projectName+'.appspot.com')) {
      let t1=fileRef.delete().subscribe(()=>{
          del.bind(this)();
          t1.unsubscribe();
       },
       (error)=>{
         this.msg=error.message;
         this.posting=false;
      });
   }  
   else  del.bind(this)();

   function del() {


      this.msg="Deleting...(users info)";
      let t2=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("posts").update({
        datas: firebase.firestore.FieldValue.arrayRemove(this.post.id),
        names: firebase.firestore.FieldValue.arrayRemove(this.post.id.slice(0, 13)+'#'+this.post.title)          
      })
      .then(()=> {
      }).catch((error)=> {
         errorMsg+=error.message+', '; Error=true;
      });

      this.msg="Deleting...(comments)";


      this.msg="Deleting...(post)";  
      let t3=this.db.collection("posts").doc(this.post.id).delete().then(()=>{
      }).catch((error)=>{
         errorMsg+=error.message+', '; Error=true;
      });

      Promise.all([t2,t3])
       .then(()=> {
          if(Error) {
            this.posting=false;
            this.msg=errorMsg;
          }
          else this.msg="Deleted Sucess!";
       })
      .catch((error)=> {
          this.msg=error.message;
          this.posting=false;          
      });
   }

  }
}














