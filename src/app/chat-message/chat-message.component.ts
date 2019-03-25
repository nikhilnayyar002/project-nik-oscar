import { Component, OnInit,Input } from '@angular/core';
import { PostService} from '../post.service';
import { ChatService} from '../chat.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent {


  @Input() msg;
  @Input() uid;
  @Input() isLast;

  constructor(private ps:PostService, private cserv:ChatService) { }

  ngAfterViewInit() {
    if(this.isLast) {
      let x=document.querySelector('#n'+this.msg.id);
      x.scrollIntoView(); 
    }
  }

  getID(id) {
    return 'n'+id;
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
