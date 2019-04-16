import { Component, OnInit } from '@angular/core';
import { NotifService, NotifMessage } from 'src/app/notif.service';
import { FriendService } from 'src/app/friend.service';
import { NotifType } from 'src/app/shared/global';
import { Router } from '@angular/router';

@Component({
  selector: 'app-popup-notif',
  templateUrl: './popup-notif.component.html',
  styleUrls: ['./popup-notif.component.scss']
})
export class PopupNotifComponent implements OnInit {

  constructor(
    public ns:NotifService,
    public fs:FriendService,
    private router:Router
     ) { }

  ngOnInit() {
  }

  scroll(link) {
    let x = document.querySelector(`#${link}`);
    if (x){
        x.scrollIntoView();
    }
  }

  navigate(msg:NotifMessage) {
    if(msg.type==NotifType.FriendConfirmed) {
      this.router.navigate([{ outlets: { primary:`info/users/${msg.data.id}`,popup: null }}]);      
    }
    else if(msg.type==NotifType.Post) {
      this.router.navigate([{ outlets: { primary:'posts',popup: null }}]);      
    }
  }

  ngOnDestroy() {
    this.ns.viewed();
  }
}
