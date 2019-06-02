
import { Component, OnInit , Input, ChangeDetectorRef,EventEmitter,Output} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { Upload } from 'src/app/model/upload';
import { FILES, FileType, encodeImageToUrl, rtnFileType } from 'src/app/shared/global';
import { UploadService } from 'src/app/upload.service';
import { Observable } from 'rxjs';
import { PostService } from 'src/app/post.service';
import { Router } from '@angular/router';

//upload component has two faces one for uploading and 2nd for editing

@Component({
  selector: 'app-upload-data',
  templateUrl: './upload-data.component.html',
  styleUrls: ['./upload-data.component.scss'],
  providers:[PostService]
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class UploadDataComponent implements OnInit {

  @Input() upload:Upload;  //upload 
  canEditUpload:boolean=true; //no way to edit upload when false
  editTitle:'close'|'edit'='close'; //title for edit button
  image:string; //image buffer
  prevUploadId:string; //help in upload input changes
  fileTypes:Array<FileType>=FILES;

  uploading=false;  //is uploading
  file:File;
  fileSize:number;  //megaBytes

  dataType = new FormControl('link');  //link|file
  fileType=new FormControl(FILES[4]);  //file type
  detail=new FormControl(''); //detail
  isPublic:boolean=true;   //whether to upload as public 

  title=new FormControl('', Validators.required);
  link=new FormControl('', Validators.required);


  constructor(
    private cdr:ChangeDetectorRef,
    public us:UploadService,
    private router:Router
  ) { }

  //toggle input controls as disable, this feature helps prevent editing of Upload
  toggleUploadDisable() {
         //initially set to false prevents editing
     let f = document.forms['upload'].getElementsByTagName('input'); //get all input elem
     for (let i of f)
         i.disabled=this.canEditUpload;

     f = document.forms['upload'].getElementsByTagName('textarea');
     f[0].disabled=this.canEditUpload;
     
     f = document.forms['upload'].getElementsByTagName('select');
     for (let i of f) i.disabled=this.canEditUpload; 

     this.editTitle=!this.canEditUpload?'close':'edit';
     this.canEditUpload=!this.canEditUpload;
     console.log(1); 
  }
  
  ngOnInit() {
    if(this.upload) {
      this.resetUploadData();
    }                
  }  

  resetUploadData() {
    this.dataType.setValue(this.upload.type);
    this.isPublic=this.upload.isPublic;
    this.detail.setValue(this.upload.detail);

    this.fileType.setValue(rtnFileType(this.upload.fileType));
    this.image=this.fileType.value.id=='image'?this.upload.data:'';
    this.link.setValue(this.upload.type=='link'?this.upload.data:'');
    this.title.setValue(this.upload.title);
    this.prevUploadId=this.upload.id; 
  }

  ngAfterViewInit() {
    if(this.upload) {  
      this.toggleUploadDisable();
      this.cdr.detectChanges(); //prevents angular one way data binding rule avoilation
    }
  }

  ngOnChanges(){
    if(this.upload && this.prevUploadId && this.prevUploadId!=this.upload.id) {
      this.resetUploadData();
      if(this.canEditUpload) this.toggleUploadDisable();   
    }
  }

  encodeFile(element) {
    this.file = element.target.files[0];
    if(this.file) {
      this.title.setValue(this.file.name);
      let isSuccess,extension;

      if (!(this.fileType.value.id=='any')) {
        extension = this.file.name.split('.').pop().toLowerCase(); 
        isSuccess = this.fileType.value.ext.indexOf(extension) > -1;
      }

      if (isSuccess || this.fileType.value.id=='any') {
        this.us.msg="";
        let size=this.file.size;

        if(size > 1048576*10) {
          this.us.msg='file size exceeds 10MB';
          this.file=null;
          element.target.value=null;
        }

        if(this.fileType.value.id=='image' && this.file) {
          let reader = new FileReader();
          reader.onloadend = ()=>{this.image=<string>reader.result};
          reader.readAsDataURL(this.file);
        }
        else this.image='';
      }
      else {
        this.us.msg="Invalid file type selected.";
        this.file=null;
        //if(this.upload) this.fileSelectionWasMade=true;
      }
    }
  }

  paste(event:any) {
      let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
      let blob = null;
      if (items.length && items[0].type.indexOf("image") === 0) 
        blob = items[0].getAsFile();
      else return;  

      if (blob !== null) {
        this.file=blob;
        let reader = new FileReader();
        reader.onload = (event:any)=> {
          this.image = event.target.result;
          this.title.setValue((new Date).getTime()+'');        
        };
        reader.readAsDataURL(blob);
      }
  }

  fileTypeChanged() {
     this.us.msg="Please select your file again.";
     this.file=null;
     //if(this.upload) this.fileSelec=true;
     this.image='';
  }

  uploadData() {
    this.uploading=true;

    let t=this.us.uploadData( this.upload,this.dataType.value,
      this.dataType.value=='file'?this.file:this.link.value,
      this.title.value, this.fileType.value, this.detail.value, this.isPublic
    );
    if(typeof(t)=='string') {
      this.uploading=false;
      return this.us.msg=t;
    } 
    else if(t instanceof Promise) {
      t.then(()=>{
        this.uploading=false;
        this.us.msg='';
      })
      .catch((error)=>{
        console.log("createupload (promise-all): "+error.message);
        this.uploading=false;
        this.us.msg=error.message;
      });
    }
    else if(t instanceof Observable){
      t.pipe(take(1)).subscribe((prom)=>{
        prom.then(()=>{
          this.uploading=false;
          this.us.msg='';
          this.router.navigate([{ outlets: { popup: null  }}]);
        })
        .catch((error)=>{
          console.log("createupload (promise-all): "+error.message);
          this.uploading=false;
          this.us.msg=error.message;
        });
      });
    } 
  }

  delete() {
    this.uploading=true;
    let t=this.us.delete(this.upload);

    if(t instanceof Promise) {
      t.then(()=>{
        this.uploading=false;
      })
      .catch((error)=>{
        console.log("deleteupload (promise-all): "+error.message);
        this.uploading=false;
      });
    }
    else if(t instanceof Observable){
      t.pipe(take(1)).subscribe((prom)=>{
        prom.then(()=>{
          this.uploading=false;
          this.us.msg='';
          this.deletedEvent.emit('del');
        })
        .catch((error)=>{
          console.log("deleteupload (promise-all): "+error.message);
          this.uploading=false;
          this.us.msg='error.message';
        });
      });
    } 
  }

  @Output() deletedEvent = new EventEmitter();

}

