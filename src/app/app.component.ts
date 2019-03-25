import { HostListener, Component, OnInit } from '@angular/core';
import { SignInCheckService} from './sign-in-check.service';
import { Router}   from '@angular/router';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { NotifyService} from './notify.service';
import { FriendService} from './friend.service';
import { ChatDirective } from './chat.directive';
import { ViewChild, ComponentFactoryResolver } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
import 'hammerjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

//@AutoUnsubscribe().pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class AppComponent implements OnInit {

  signInLabel="SignIn\Up";
  constructor(private componentFactoryResolver: ComponentFactoryResolver, private fserv:FriendService, private notif:NotifyService, public router:Router, public auth:SignInCheckService){ }
  fservSubs;
  
  @ViewChild(ChatDirective) chatHost: ChatDirective;
  componentRef;


  loadComponent() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChatComponent);
    let viewContainerRef = this.chatHost.viewContainerRef;
    viewContainerRef.clear();
    this.componentRef = viewContainerRef.createComponent(componentFactory);
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHander(event) {
     this.auth.setStatus('offline',this.auth.user?this.auth.user.uid:'');
  }


  ngOnInit() {
    type fType={friends_req:Array<string>;friends_conf:Array<string>;friends_req_rec:Array<string>;chats_req_rec:Array<string>; };
    this.auth.check.subscribe({
         next:(result)=>{
          if(result) this.signInLabel="SignOut";
          else this.signInLabel="SignIn\Up";
          
          if(result) {
            this.fservSubs=this.fserv.make_friends$.subscribe({
               next:(data:fType)=>{

                if(data.friends_req_rec) {
                   this.notif.clearNotif("req");
                   for(var i of data.friends_req_rec) {
                     this.notif.push({ 
                         msg:"friend reqest received",
                         viewed:false,
                          title:'friend_req',
                         uid:i,
                         link:'',user:''
                     });
                   }
                   this.notif.setN(data.friends_req_rec.length);                 
                }
                if(data.friends_conf) {
                  this.notif.clearNotif("conf");
                  for(var i of data.friends_conf) {
                    this.notif.push({ 
                     msg:"You and he are now friends",
                      viewed:false,
                      title:'friend_conf',
                     uid:i,
                     link:'',user:''
                   });
                  }
                  this.notif.setN(data.friends_conf.length);                  
                }
                if(data.chats_req_rec) {
                  this.notif.clearNotif("chat_req");
                  for(var i of data.chats_req_rec) {
                    this.notif.push({ 
                     msg:"Chat request Received.",
                      viewed:false,
                      title:'chat_req',
                     uid:i,
                     link:'',user:''
                   });
                  }
                  this.notif.setN(data.chats_req_rec.length);                  
                }
               }
            });
            this.loadComponent();
          }
          else {         
            if(this.fservSubs) this.fservSubs.unsubscribe();
            if(this.componentRef) this.componentRef.destroy();
            this.fservSubs=this.componentRef=null;
            this.notif.clear();
          }

         }
    });
    /*
    window.onresize=()=>{
      console.log('w: '+window.innerWidth+', h:'+window.innerHeight);
    }
    */
  }

  paletCheck(palet) {
    //let t=window.pageYOffset;
    //setTimeout(()=>{window.scrollTo(0, t)},0);
    if(this.router.url.includes(palet)) {
      this.router.navigate([{ outlets: { palet: null  }}]);
    }
  }

  bodyClk(event) {
    if(event.target.id=='overlay') {
      this.router.navigate([{ outlets: { palet: null  }}]);
    }
  }

}


