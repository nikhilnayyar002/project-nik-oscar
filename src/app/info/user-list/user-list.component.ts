import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { ActivatedRoute }  from '@angular/router';
import { AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})

@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class UsersListComponent implements OnInit {

  trackById(index: number, user): string {return user.uid; }
  group;

  constructor(
  	private route:ActivatedRoute,
  	private db:AngularFirestore
  	) { }

  ngOnInit() {

   this.route.parent.params.pipe(takeWhileAlive(this)).subscribe(params => {
       let gid=params["id"];
       this.db.collection('chats').doc(gid).valueChanges()
       .pipe(takeWhileAlive(this)).subscribe((data:any)=>{	
       	 this.group=data;
       });
   });

  }

}

