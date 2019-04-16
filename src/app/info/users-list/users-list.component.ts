import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { takeWhileAlive, AutoUnsubscribe } from 'take-while-alive';
import { Group } from 'src/app/model/group';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
@AutoUnsubscribe()
export class UsersListComponent implements OnInit {

  constructor(private route:ActivatedRoute,private db:AngularFirestore) {

  }

  group:Group;
  
  ngOnInit() {

   this.route.parent.params.pipe(takeWhileAlive(this)).subscribe(params => {
       let gid=params["id"];
       this.db.collection('chats').doc(gid).valueChanges().pipe(takeWhileAlive(this)).subscribe((data:Group)=>{	
       	 this.group=data;
       });
   });
  } 

}
