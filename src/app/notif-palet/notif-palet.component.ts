import { Component, OnInit } from '@angular/core';
import { NotifyService} from '../notify.service';
import { PostService} from '../post.service';
import { FriendService} from '../friend.service';
import { ChatService} from '../chat.service';


@Component({
  selector: 'app-notif-palet',
  templateUrl: './notif-palet.component.html',
  styleUrls: ['./notif-palet.component.css']
})
export class NotifPaletComponent implements OnInit {

  users;
  
  constructor(private cserv:ChatService, private fserv:FriendService, private ps:PostService,public notif:NotifyService) {
  }
  ngOnInit() {
    let subs=this.ps.users$.subscribe((users)=>{
      this.users=users;

    });
  }
  
  getUser(uid) {
    type User={uid:string;image:string;privacy:{show_image:boolean;};name:string;};
    if(this.users) {
        const data:User=(this.users.filter((user:User) => user.uid==uid))[0];
        if(data.image && data.privacy.show_image) 
          return { image:data.image, name:data.name, uid:data.uid};
        else  return { image:"", name:data.name, uid:data.uid}; 
    }
    else  
        return { image:"", name:"", uid:""};

  }
  
  scroll(link) {
    let x = document.querySelector(`#${link}`);
    if (x){
        x.scrollIntoView();
    }
  }
  ngOnDestroy() {
    this.notif.viewed();
  }
}
