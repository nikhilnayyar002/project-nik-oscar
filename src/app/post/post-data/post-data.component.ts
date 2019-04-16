import { Component, OnInit, Input, Output,  EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { Router }  from '@angular/router';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { PostService} from '../../post.service';
import { Post } from 'src/app/model/post';
import { encodeImageToUrl } from 'src/app/shared/global';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-post-data',
  templateUrl: './post-data.component.html',
  styleUrls: ['./post-data.component.scss']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class PostDataComponent implements OnInit {

  @Input() post:Post; 
  canEditPost:boolean=true; //no way to edit post when false
  editTitle:'close'|'edit'='close'; //title for edit button
  image:string=''; //image buffer
  prevPostId:string; //help in post input changes

  posting=false;  //is posting
  file:File;
  msg:string; //message to display at bottom

  type = new FormControl('link');  //link|template
  detail=new FormControl(''); //detail
  isPublic:boolean=true;   //whether to post as public 
  
  title=new FormControl('', Validators.required);
  link=new FormControl('', Validators.required);

  constructor(
    private router:Router,
    public ps:PostService
    ) { } 

  //toggle input controls as disable, this feature helps prevent editing of post
  togglePostDisable() {
         //initially set to false prevents editing
     let f = document.forms['post'].getElementsByTagName('input'); //get all input elem
     for (let i of f)
         i.disabled=this.canEditPost;

     f = document.forms['post'].getElementsByTagName('textarea');
     f[0].disabled=this.canEditPost;
     
     f = document.forms['post'].getElementsByTagName('select');
     for (let i of f) i.disabled=this.canEditPost; 

     this.editTitle=!this.canEditPost?'close':'edit';
     this.canEditPost=!this.canEditPost;  
  }

  ngOnInit() {
    if(this.post) {
      this.resetPostData();
    }          
  } 

  ngAfterViewInit() {
   if(this.post) 
    setTimeout(() =>this.togglePostDisable(), 0); 
  }

  resetPostData() {
    this.type.setValue(this.post.type);
    this.isPublic=this.post.isPublic;
    this.detail.setValue(this.post.detail);
    this.image=this.post.image;
    this.link.setValue(this.post.data);  //link or template url   
    this.title.setValue(this.post.title);
    this.prevPostId=this.post.id;
  }

  ngOnChanges() {  
    if(this.post && this.prevPostId && this.prevPostId!=this.post.id) {
      this.resetPostData();
      if(this.canEditPost) this.togglePostDisable();   
    }
  } 

  encodeImage(element) {
    let file=element.target.files[0];
    if(file) {
      let reader:FileReader=encodeImageToUrl.bind(this)(file);
      if(!reader) {
        this.msg="Invalid img file selected.";
      }
      else 
        reader.onloadend=()=>{
          this.msg="";
          this.image=<string>reader.result;
          this.file=file;
        };
    }

  }
  
  deleteImage() {
    this.image='';
    this.file=null;
  }
  
  paste(event:any) {
    let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
    let blob = null;
    //careful type may or may not be there
    if (items.length && items[0].type.indexOf("image") === 0) {
      blob = items[0].getAsFile();
      if (blob !== null) {
       this.file=blob;   
       let reader = new FileReader();
       reader.onload = (event:any)=> {
        this.image = event.target.result;    
       };
       reader.readAsDataURL(blob);
     }
    }
    else {
      setTimeout(()=>{ 
        this.image=event.target.value;    //url to image on web
        this.file=null;
      },0);
  }
}


  doPost() {
    this.posting=true;
    let t:Observable<Promise<any>>=this.ps.postData(
      this.post,  this.file,  this.image,  this.isPublic,  this.type.value,
      this.link.value,  this.title.value,  this.detail.value
    );
    t.pipe(take(1)).subscribe((prom)=>{
        prom.then(()=>{
          this.posting=false;
          this.ps.msg='';
          this.router.navigate([{ outlets: { popup: null  }}]);
        })
        .catch((error)=>{
          console.log("createpost (promise-all): "+error.message);
          this.posting=false;
        });
    });  
  }

  delete() {
    this.posting=true;
    let t:Observable<Promise<any>>=this.ps.delete(this.post);
    t.pipe(take(1)).subscribe((prom)=>{
        prom.then(()=>{
          this.posting=false;
          this.ps.msg='';
          this.deletedEvent.emit('del');
        })
        .catch((error)=>{
          console.log("deleteupost (promise-all): "+error.message);
          this.posting=false;
        });
    });
  }

  @Output() deletedEvent = new EventEmitter();

}

