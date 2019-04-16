import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { ActivatedRoute }  from '@angular/router';
import { PoolService } from 'src/app/pool.service';

@Component({
  selector: 'app-discussions',
  templateUrl: './discussions.component.html',
  styleUrls: ['./discussions.component.scss']
})

@AutoUnsubscribe()
export class DiscussionsComponent implements OnInit {

  trackById(index: number, discussion): string {return discussion.id; }

  discussions$;
  constructor(private ps:PoolService,private route:ActivatedRoute) { }

  ngOnInit() {
   this.route.parent.params.pipe(takeWhileAlive(this)).subscribe(params => {
       let id=params["id"];
       this.ps.discussions$.pipe(this.ps.rtnDefaultIDFilter(id));
   });
  }
}