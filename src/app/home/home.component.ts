import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { PostService} from '../post.service';
import { ActivatedRoute }     from '@angular/router';
import { map ,take}           from 'rxjs/operators';
import { Router}   from '@angular/router';
import { Observable}       from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class HomeComponent implements OnInit {

  trackById(index: number, post): string {return post.id; }
  posts;

  constructor(
    private route:ActivatedRoute,
    private ps:PostService,
    private router:Router
    ) { }


  token;sp;
  ngOnInit() {

   function func(posts:Array<{is_posted:boolean; acess:string;}>) {
      if(posts)
      return posts.filter((post)=>post.is_posted&&post.acess=='public');
      else 
      return [];
   } 

    this.ps.getAllPosts(func).pipe(takeWhileAlive(this)).subscribe((data:[])=>{
       this.posts=data;
       if(!this.sp)
       this.sp=this.route.fragment.pipe(map(fragment => fragment ||'')).subscribe((data)=>{
           this.token = data;
           setTimeout(()=>{
              let x;
              if (this.token){
              /*
                  let item = document.querySelector(`#${ this.token }`);
                  let wrapper =  document.documentElement;
                  let count = item.offsetTop - wrapper.scrollTop - 50; 
                  wrapper.scrollBy({top: count, left: 0, behavior: 'smooth'});
                  
               */  
                  x=document.querySelector(`#${ this.token }`);
                  x.scrollIntoView(); 
                  document.documentElement.scrollTop-= 50;
              }
           },0);
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

  ngOnDestroy() {
    this.sp.unsubscribe();
  }

}
