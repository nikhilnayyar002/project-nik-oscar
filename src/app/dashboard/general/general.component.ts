import { Component, HostListener, ViewChild, ElementRef} from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { encodeImageToUrl } from 'src/app/shared/global';
import { Observable } from 'rxjs';
import { User } from 'src/app/model/user';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent {

  @ViewChild('bgImageElement') private bgImageElement:ElementRef;

  image:string="";  //user image buffer
  bgImage:string="";  //user bg image buffer
  bgY:'center'|'bottom'|'top'='center';
  user:User;

  msg="";
  edit=false;
  file:File;
  bgFile:File;
  saving:boolean;
  percent$:Observable<number>;

  constructor(
    private auth:AuthService,
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    ) {
    this.user={...this.auth.user};
    window.onresize=this.bgResize.bind(this);
    this.image=this.user.image;
    this.bgImage=this.user.bgImage;
  }

  bgResize() {
    let t=this.bgImageElement.nativeElement.clientWidth;
    this.bgImageElement.nativeElement.style.height=t/2.5+'px';
  }

  ngAfterViewInit(): void {
    this.bgResize();
  }

  encodeImage(element,of:'image'|'bgImage') {
    let file=element.target.files[0];
    if(file) {
      let reader:FileReader=encodeImageToUrl.bind(this)(file);
      if(!reader) {
        this.msg="Select only img file"; 
      }
      else 
        reader.onloadend=()=>{
          if(of=='image') {
            this.image=<string>reader.result;
            this.file=file;
          }
          else {
            this.bgImage=<string>reader.result;
            this.bgFile=file;
          }
        };
    }
  }

  editBG() {
    this.edit=!this.edit;
  }

  moveBG(val) {
    switch(val) {
      case 'u': if(this.bgY=='center') this.bgY='top'; else this.bgY='center'; break;
      case 'd': if(this.bgY=='center') this.bgY='bottom'; else this.bgY='center';
    }
  }

  saveFile(file:File,type:'image'|'bgImage') {
    this.saving=true;

    this.msg="Saving changes...("+type+")";
	  if(file) {
    	let filePath =`user/${type}/${this.auth.user.id}`;
    	let fileRef=this.storage.ref(filePath);
      try {
        const task = this.storage.upload(filePath, file);
        this.percent$ = task.percentageChanges(); 
          let t=task.snapshotChanges().pipe(finalize(()=>{
             fileRef.getDownloadURL().pipe(take(1)).subscribe((url)=>{
              this.user[type]=url;
              if(type=='image') this.saveFile(this.bgFile,'bgImage');
              else this.store();
             });
          })).subscribe();
       }
       catch(error) {
         console.log('user-'+type+': '+error.message);
         this.saving=false;
       }
    }
    else {
      if(type=='bgImage') this.store();
      else this.saveFile(this.bgFile,'bgImage');
    } 
  }

  store() {
    this.msg="Saving changes...(user information)";
	  this.db.collection("users").doc(`${this.auth.user.id}`).update(
      this.user
	  )
	  .then(()=> {
      this.commonSaveSucess();
	  })
	  .catch((error)=> {
      this.msg=error.message;
      this.saving=false;
  	});
  }

  commonSaveSucess() {
    this.file=this.bgFile=null;
    this.saving=false;  
		this.msg="Save Sucess!";
  }

  ngOnDestroy(): void {
    window.onresize=null;
  }

}

