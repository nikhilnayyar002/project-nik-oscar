import { HostListener, Component, OnInit, ComponentRef } from '@angular/core';
import { Router}   from '@angular/router';
import { FriendService} from './friend.service';
import { ChatDirective } from './chat.directive';
import { ViewChild, ComponentFactoryResolver } from '@angular/core';
import { NotifService } from './notif.service';
import { ChatComponent } from './home/chat/chat.component';
import { AuthService } from './auth.service';
import { PoolService } from './pool.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

//@AutoUnsubscribe().pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class AppComponent implements OnInit {


  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private fs:FriendService,
    private ns:NotifService,
    public router:Router,
    public auth:AuthService,
    public ps:PoolService
  )
  { }

  signInLabel="SignIn\Up";
  @ViewChild(ChatDirective) chatHost: ChatDirective;
  componentRef:ComponentRef<ChatComponent>;


  loadChatComponent() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChatComponent);
    let viewContainerRef = this.chatHost.viewContainerRef;
    viewContainerRef.clear();
    this.componentRef = viewContainerRef.createComponent(componentFactory);
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHander(event) {
     this.auth.setStatus('offline',this.auth.user?this.auth.user.id:'');
  }

  ngOnInit() {
    this.auth.check$.subscribe({
         next:(user)=>{
          if(user) {
            this.signInLabel="SignOut";
            this.ns.initialize(user.uid);
            this.ps.intialize(user.uid);
            //this.loadChatComponent();
          }
          else {
            this.signInLabel="SignIn\Up";
            if(this.componentRef) this.componentRef.destroy();
            this.ns.clear();
            this.ps.clear();
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
    if(this.router.url.includes(palet)) {
      this.router.navigate([{ outlets: { palet: null  }}]);
    }
    //if(dasboard)
  }

  bodyClk(event) {
    if(event.target.id=='overlay') {
      this.router.navigate([{ outlets: { palet: null  }}]);
    }
  }

}


