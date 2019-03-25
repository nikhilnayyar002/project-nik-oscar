import { Component, OnInit } from '@angular/core';
import { PostService} from '../../post.service';
import { ActivatedRoute }     from '@angular/router';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.css']
})

export class UploadsComponent implements OnInit {

  trackById(index: number, upload): string {return upload.id; }
  uploads$;
  subs;

  constructor(public ps:PostService, private route:ActivatedRoute) { 
     
  }

  ngOnInit() {

  this.subs=this.route.parent.params.subscribe(params => {
       let id=params["id"];

  	   function func(uploads:Array<{acess:string; user_id:string;}>) {
      	if(uploads)
      		return uploads.filter((upload)=>upload.acess=='public'&&upload.user_id==id);
      	else 
     		return [];
   	   } 

	   this.uploads$= this.ps.getAllUploads(func); //managed by async pipe

   });
   
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
  	if(this.subs) this.subs.unsubscribe();
  }

}
