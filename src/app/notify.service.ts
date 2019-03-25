import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor() { }
  n=0;
  msgs=[];
  working=false;
  req_msgs=[];
  conf_msgs=[];
  chat_req_msgs=[];

  push(data:{ link:string; msg:string; viewed:boolean; title:string; user:string; uid:string;}) {
    if(data.title=='friend_req') {
     this.req_msgs.unshift(data);
    }
    else if(data.title=='friend_conf') {
     this.conf_msgs.unshift(data);
    } 
    else if(data.title=='chat_req') {
     this.chat_req_msgs.unshift(data);
    }     
    else {
  	 this.msgs.unshift(data);
     ++(this.n);
    }
  }
  clear() {
    this.n=0;
    this.msgs=[];
    this.req_msgs=[];
    this.conf_msgs=[];
    this.chat_req_msgs=[];
  }

  clearNotif(str) {
    if(str=="req") this.req_msgs=[];
    else if(str=="conf") this.conf_msgs=[];
    else this.chat_req_msgs=[];
  }

  setN(i) {
    if(i) {
      ++(this.n);
    }
  }

  viewed() {
    this.working=true;
  	let t=0;
  	while(this.n) {
    if(this.msgs.length!=0)
  	 this.msgs[t++].viewed=true;
  	 --(this.n);
  	}
    this.working=false;    
  }
}

