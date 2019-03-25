import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { PostService} from '../../post.service';
import { ActivatedRoute }  from '@angular/router';
import { map ,take}    from 'rxjs/operators';
import { AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-discussions',
  templateUrl: './discussions.component.html',
  styleUrls: ['./discussions.component.css']
})

@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class DiscussionsComponent implements OnInit {

  trackById(index: number, discussion): string {return discussion.id; }

  discussions;
  userDiscFilter;

  constructor(
  	private route:ActivatedRoute,
  	private ps:PostService,
  	private db:AngularFirestore
  	) { }

  ngOnInit() {

   this.route.parent.params.pipe(takeWhileAlive(this)).subscribe(params => {
       let gid=params["id"];
       this.userDiscFilter=(data:any)=>data.chat_id==gid;
       this.db.collection("discussions").valueChanges().pipe(takeWhileAlive(this))
       .subscribe((data)=>{
       		this.discussions=data;
       });
   });

  }
}