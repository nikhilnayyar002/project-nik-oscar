import { Component,Input } from '@angular/core';
import { HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router}   from '@angular/router';
import { copyToClipboard } from 'src/app/shared/global';
import { Post } from 'src/app/model/post';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { PoolService } from 'src/app/pool.service';
import { PostService } from 'src/app/post.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css'],
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
  comments$:Observable<Array<Comment>>;
  
  detail=new FormControl('');
  tooltipText:'Copy to clipboard'|'copied!'='Copy to clipboard';
  liked:boolean=null;
  commentsClicked:boolean=false;

  constructor(
    private postSer:PostService,
    private router:Router,
    private ps:PoolService
    ) { }
  
  ngOnInit(): void {
    this.ps.check$.pipe(takeWhileAlive(this)).subscribe((user)=>{
      if(user) {
        this.ps.posts$.pipe(this.ps.rtnDefaultIDFilter(user.uid)).subscribe((posts:Array<Post>)=>{
            if(posts.length) {
              let t=posts[0].likes.filter(id=>id==user.uid) 
              if(t.length) this.liked=true;
              else this.liked=false;
            }
        });
      }
      else this.liked=null;
    });
    this.comments$=this.ps.getComments(this.post.id);
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
    if(this.like==null) return false;
    this.liked=!this.liked;
    this.postSer.likePost(this.liked,this.post);
    return false; 
  }

  comment() {
    if(this.detail.value) 
      this.postSer.commentPost(this.detail.value,this.post);
    return false; 
  }

  trackById(index: number, comment): string { return comment.id; }

  copyToClipboard() {
    copyToClipboard('upload:'+ this.post.id);
    return false
  }
  

}
