import { Component, OnInit, Input } from '@angular/core';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { ActivatedRoute }     from '@angular/router';
import { map ,take}           from 'rxjs/operators';
import { Observable}       from 'rxjs';
import { Post } from 'src/app/model/post';
import { global } from 'src/app/shared/global';
import { PoolService } from 'src/app/pool.service';

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.scss']
})
@AutoUnsubscribe()
export class PostViewComponent implements OnInit {

  trackById(index: number, post): string {return post.id; }

  constructor(
    private route:ActivatedRoute,
    private ps:PoolService
    ) { }

  @Input() inputPosts=null;
  posts;
  anchorScrollInit:boolean=false;

  ngOnInit() {
    if(this.inputPosts) return;
    let func=(datas:Array<Post>)=> datas.filter(data=> data.isPublic);
    this.ps.posts$.pipe(map(func),takeWhileAlive(this)).subscribe((datas)=>{
      this.posts=datas;
      if(!this.anchorScrollInit) {
        this.anchorScrollInit=true;
        this.route.fragment.pipe(map(fragment => fragment ||''),takeWhileAlive(this))
        .subscribe((data)=>{
          setTimeout(()=>{
            if (data){ 
              let x=document.querySelector(`#${data}`);
              x.scrollIntoView(); 
              document.documentElement.scrollTop-= global.headerHeight;
            }
          },0);
        });
      }
    }); 
  }

}
