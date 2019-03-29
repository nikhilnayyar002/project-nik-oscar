import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  styleUrls: ['./post-data.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class PostDataComponent implements OnInit {

  @Input() post:Post; 
  canEditPost:boolean=true; //no way to edit post when false
  editTitle:'close'|'edit'='close'; //title for edit button
  image:string; //image buffer
  prevPostId:string; //help in post input changes

  posting=false;  //is posting
  file:File;
  msg:string; //message to display at bottom

  type = new FormControl('link');  //link|template
  detail=new FormControl(''); //detail
  isPublic:boolean=false;   //whether to post as public 
  title:string="";  //post title
  link="";  //post link template url or url
  
  constructor(
    private router:Router,
    private ps:PostService
    ) { } 

  //toggle input controls as disable, this feature helps prevent editing of post
  togglePostDisable() {
         //initially set to false prevents editing
     let f = document.forms['Post'].getElementsByTagName('input'); //get all input elem
     for (let i of f)
         i.disabled=this.canEditPost;

     f = document.forms['Post'].getElementsByTagName('textarea');
     f[0].disabled=this.canEditPost;
     
     f = document.forms['Post'].getElementsByTagName('select');
     for (let i of f) i.disabled=this.canEditPost; 

     this.editTitle=this.canEditPost?'close':'edit';
     this.canEditPost=!this.canEditPost;  
  }

  ngOnInit() {
    if(this.post) {
      this.type.setValue(this.post.type);
      this.isPublic=this.post.isPublic;
      this.detail.setValue(this.post.detail);
      this.image=this.post.image;
      this.link=this.post.data;  //link or template url   
      this.title=this.post.title;
      this.prevPostId=this.post.id;
    }          
  } 

  ngAfterViewInit() {
   if(this.post) 
    setTimeout(() =>this.togglePostDisable(), 0); 
  }

  ngOnChanges() {  
    if(this.post && this.prevPostId && this.prevPostId!=this.post.id) {
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
    this.image=null;
    this.file=null
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


  doPost(isPosted) {
    this.posting=true;
    let t=this.ps.postData(
      this.post,  this.file,  this.image,  this.isPublic,  this.type.value,
      this.link,  this.title,  this.detail.value
    );

    if(t instanceof Promise) {
      t.then(()=>{
        this.router.navigate([{ outlets: { palet: null  }}]);
      })
      .catch((error)=>{
        console.log("createpost (promise-all): "+error.message);
        this.posting=false;
      });
    }
    else if(t instanceof Observable){
      t.pipe(take(1)).subscribe((prom)=>{
        prom.then(()=>{
          this.router.navigate([{ outlets: { palet: null  }}]);
        })
        .catch((error)=>{
          console.log("createpost (promise-all): "+error.message);
          this.posting=false;
        });
      });
    } 
  }

  delete() {
    this.posting=true;
    let t=this.ps.delete(this.post);

    if(t instanceof Promise) {
      t.then(()=>{
        this.posting=false;
      })
      .catch((error)=>{
        console.log("deletepost (promise-all): "+error.message);
        this.posting=false;
      });
    }
    else if(t instanceof Observable){
      t.pipe(take(1)).subscribe((prom)=>{
        prom.then(()=>{
          this.posting=false;
        })
        .catch((error)=>{
          console.log("deleteupost (promise-all): "+error.message);
          this.posting=false;
        });
      });
    } 
  }

}

