import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { PostService} from '../../post.service';
import { ActivatedRoute }  from '@angular/router';
import { map ,take}    from 'rxjs/operators';
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
  	private ps:PostService,
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

