import { HostListener, Component, OnInit, ComponentRef, ElementRef } from '@angular/core';
import { Router}   from '@angular/router';
import { FriendService} from './friend.service';
import { ChatDirective } from './chat.directive';
import { ViewChild, ComponentFactoryResolver } from '@angular/core';
import { NotifService } from './notif.service';
import { AuthService } from './auth.service';
import { PoolService } from './pool.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private fs:FriendService,
    public ns:NotifService,
    public router:Router,
    public auth:AuthService,
    public ps:PoolService
  )
  { }

  signInLabel="SignIn\Up";
  @ViewChild(ChatDirective) chatHost: ChatDirective;
  @ViewChild('sidebar') sidebar:ElementRef;
  isLessThan900px=false;
  toggleChatBox=false;


  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHander(event) {
     this.auth.setStatus('offline',this.auth.user?this.auth.user.id:'');
  }

  ngOnInit() {
    this.auth.check$.subscribe({
         next:(user)=>{
          if(user) {
            this.ps.intialize(user.uid);
            this.ns.initialize(user.uid);
            //this.loadChatComponent();
          }
          else {
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

  ngAfterViewInit(): void {

    function mediaQueryFor900px(x) {
      let main:HTMLElement=document.querySelector('.main');
      if (x.matches) { 
        this.isLessThan900px=true;
        this.sidebar.nativeElement.style.left='-210px';
        main.style.gridColumn=' 1/span 2';
        
      } else {
        let d:HTMLElement=document.querySelector('.sidebar-overlay');
        d.style.display='none';
        this.isLessThan900px=false;
        this.sidebar.nativeElement.style.left='0px';
        main.style.gridColumn=' 2/span 1';
      }
    }

    let x = window.matchMedia("(max-width: 900px)");
    mediaQueryFor900px.bind(this)(x);
    x.addListener(mediaQueryFor900px.bind(this));
  }
  
  /** created just for routes in sidebar.
   *  actually when i have a popup opened and then i clicked some router link in sidebar
   *  it reveals the popup in browser url and get stored as a history which you do 
   *  not want to have like.
   * 
   *  In short this thing works like a charm
   */
  ispopupOpen:boolean = false;
  
  /** some kind of check */
  popupCheck(popup) {

    if(this.isLessThan900px && this.sidebar.nativeElement.style.left=='0px')
      this.dashboardClick(false);
    if(this.router.url.includes(popup)) {
      this.router.navigate([{ outlets: { popup: null  }}]);
      this.ispopupOpen = false
    } else {
      this.ispopupOpen = true
    }

  }

  bodyClk(event) {
    if(event.target.id=='overlay') {
      this.router.navigate([{ outlets: { popup: null  }}]);
    }
  }

  dashboardClick(closePopupIfThere=true) {
    let q=this.sidebar.nativeElement;
    let d:HTMLElement=document.querySelector('.sidebar-overlay');

    if(closePopupIfThere && this.router.url.includes('popup')) {
      this.router.navigate([{ outlets: { popup: null  }}]);
    }

    if(this.isLessThan900px) {
      if(q.style.left=='-210px') {
        q.style.left='0px';
        d.style.display='block';
      }
      else  {
        q.style.left='-210px';
        d.style.display='none';
      }
    }
    else {
      let main:HTMLElement=document.querySelector('.main');
      if(q.style.left=='-210px') {
        q.style.left='0px';
        main.style.gridColumn=' 2/span 1';
      }
      else  {
        q.style.left='-210px';
        main.style.gridColumn=' 1/span 2'; 
      }
    }
    return false;
  }

}


