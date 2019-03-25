import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { SignInCheckService} from '../../sign-in-check.service';
import { PostService} from '../../post.service';


@Component({
  selector: 'app-public-upload',
  templateUrl: './public-upload.component.html',
  styleUrls: ['./public-upload.component.css']
})

export class PublicUploadComponent implements OnInit {

  trackById(index: number, upload): string {return upload.id; }
  uploads$;


  constructor(public ps:PostService, private auth:SignInCheckService,private db: AngularFirestore) { 
     
  }

  ngOnInit() {
   function func(uploads:Array<{acess:string;}>) {
      return uploads.filter((upload)=>upload.acess=='public');
   } 
   this.uploads$= this.ps.getAllUploads(func); //managed by async pipe
  }

  getUser(uid) {
    type User={uid:string;image:string;privacy:{show_image:boolean;};name:string;};
    let userFilter=(uid,users:Array<User>)=> {
      const data:User=(users.filter((user:User) => user.uid==uid))[0];
      if(data.image && data.privacy.show_image) 
          return { image:data.image, name:data.name, uid:data.uid};
      else  return { image:"", name:data.name, uid:data.uid}; 
    };
   return this.ps.getUser(uid,userFilter);
  }

  ngOnDestroy() {
  
  }

}
