
import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { PostService} from '../../post.service';
import { ActivatedRoute }     from '@angular/router';
import { map ,take}                from 'rxjs/operators';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})

@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class PostsComponent implements OnInit {

  trackById(index: number, post): string {return post.id; }
  posts;

  constructor(private route:ActivatedRoute,private ps:PostService) { 
      
  }

  ngOnInit() {

   this.route.parent.params.pipe(takeWhileAlive(this)).subscribe(params => {
       let id=params["id"];

  	   function func(posts:Array<{is_posted:boolean; acess:string; user_id:string;}>) {
      	if(posts)
      		return posts.filter((post)=>post.is_posted&&post.acess=='public'&&post.user_id==id);
      	else 
     		return [];
   	   } 

       this.ps.getAllPosts(func).pipe(takeWhileAlive(this)).subscribe((data)=>{
      	this.posts=data;
       });


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


}

