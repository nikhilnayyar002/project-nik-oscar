import { Component,Input } from '@angular/core';
import { HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router}   from '@angular/router';
import { copyToClipboard } from 'src/app/shared/global';
import { Post } from 'src/app/model/post';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { PoolService } from 'src/app/pool.service';
import { PostService } from 'src/app/post.service';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { Comment } from 'src/app/model/comment';
import { User } from 'src/app/model/user';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
  styles : [`
        :host {
            width: 70%;
            margin: 10px auto;
            display: block;
        }
    `]
})

@AutoUnsubscribe()
export class PostCardComponent {

  @Input() post:Post;
  @Input() link=false;

  comments:Comment[];
  user:User;

  detail=new FormControl('');
  tooltipText:'Copy to clipboard'|'copied!'='Copy to clipboard';
  liked:boolean=null;
  commentsClicked:boolean=false;


  constructor(
    private postSer:PostService,
    private router:Router,
    public ps:PoolService,
    public auth:AuthService
    ) { }
  
  ngOnInit(): void {
    this.auth.check$.pipe(takeWhileAlive(this)).subscribe((user)=>{
      if(user) {
        let t=this.post.likes.filter(id=>id==this.auth.user.id);
        if(t.length) this.liked=true;
        else this.liked=false; 
      }
      else this.liked=null;
    });

    this.ps.getComments(this.post.id).pipe(takeWhileAlive(this)).subscribe((datas)=>{
      this.comments=datas;
    });
    this.ps.users$.pipe(this.ps.rtnDefaultIDFilter(this.post.userID),take(1)).subscribe((users)=>{
      this.user=users[0];
    })
  }

  getID(id:string) { return 'n'+id;}
 
  @HostListener('click') onClick() {
    if(this.post && this.post.data) {
      if(this.post.type=='link')
        window.open(this.post.data)
      else 
        this.router.navigate([this.post.data]);
    }
  };

  like() {
    if(this.liked==null) return false;
    this.liked=!this.liked;
    this.postSer.likePost(this.liked,this.post);
    return false; 
  }

  comment() {
    if(this.liked==null) return false;
    if(this.detail.value) 
      this.postSer.commentPost(this.detail.value,this.post);
    return false; 
  }

  trackById(index: number, comment): string { return comment.id; }

  copyToClipboard() {
    copyToClipboard('post:'+ this.post.id);
    return false
  }
  

}
