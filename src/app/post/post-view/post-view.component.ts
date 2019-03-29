import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./post-view.component.css']
})
@AutoUnsubscribe()
export class PostViewComponent implements OnInit {

  trackById(index: number, post): string {return post.id; }

  constructor(
    private route:ActivatedRoute,
    private ps:PoolService
    ) { }

  posts$:Observable<Array<Post>>;

  ngOnInit() {

    let func=(datas:Array<Post>)=> datas.filter(data=> data.isPublic);
    this.posts$= this.ps.posts$.pipe(map(func));
    this.posts$.pipe(take(1)).subscribe(()=>{
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
    });
      
  }

}
