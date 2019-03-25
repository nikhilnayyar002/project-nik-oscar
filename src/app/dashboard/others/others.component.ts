import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { SignInCheckService} from '../../sign-in-check.service';
import {User} from '../user';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { PostService} from '../../post.service';
import { PostParentChildService} from '../../post-parent-child.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-others',
  templateUrl: './others.component.html',
  styleUrls: ['./others.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
export class OthersComponent {
  status;
  user;
  msg="";
  data;
  subs;
  display="";

  posts=null;
  uploads=null;
  friends$;
  chats$;
  templates$;

  constructor(private ps:PostService, private auth:SignInCheckService,private db: AngularFirestore, private ser:PostParentChildService) {
    
    this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("posts").valueChanges().pipe(takeWhileAlive(this)).subscribe((data:{datas:[];names:[];})=>{
      data.datas.reverse();
      data.names.reverse();
      this.posts=data;
    });  

    this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("uploads").valueChanges().pipe(takeWhileAlive(this)).subscribe((data:{datas:[];names:[];})=>{
      data.datas.reverse();
      data.names.reverse();
      this.uploads=data; 
    });   
    this.friends$=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("friends").valueChanges();
    this.chats$=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("chats").valueChanges();
    this.templates$=this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("templates").valueChanges();
  }
  
  select(name,id?) {
   if(this.subs) this.subs.unsubscribe();  
   function func(datas:Array<{id:string;}>) {
      return datas.filter((data)=>data.id==id);
   } 
   if(name=='posts')
      this.subs=this.ps.getAllPosts(func).subscribe({next:(datas)=>{
          this.data=datas[0];
      }});
   else if(name=='uploads') 
      this.subs=this.ps.getAllUploads(func).subscribe({next:(datas)=>{
          this.data=datas[0];       
      }});
   else if(name=='friends')
          this.data={iam:'friends'}; //<{iam:string;}>

  }
  ngOnDestroy() {
   if(this.subs) this.subs.unsubscribe();   
  }
}

