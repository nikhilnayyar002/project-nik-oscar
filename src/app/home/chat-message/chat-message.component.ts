import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent {


  @Input() msg;
  //@Input() uid;
  @Input() isLast;

  constructor() { }

  ngAfterViewInit() {
    if(this.isLast) {
      let x=document.querySelector('#n'+this.msg.id);
      x.scrollIntoView(); 
    }
  }

  getID(id) { return 'n'+id; }
 

}
