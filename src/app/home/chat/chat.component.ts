import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject , Subscription} from 'rxjs';
import { debounceTime, map,distinctUntilChanged, switchMap, take} from 'rxjs/operators';
import { AngularFirestore,Query} from '@angular/fire/firestore';
import { encodeImageToUrl, copyToClipboard } from 'src/app/shared/global';
import { AuthService } from 'src/app/auth.service';
import { PoolService } from 'src/app/pool.service';
import { User } from 'src/app/model/user';
import { Discussion } from 'src/app/model/discussion';
import { Group } from 'src/app/model/group';
import { ChatService } from 'src/app/chat.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  styles : [`
        :host {
        position: fixed;
        top:50px;
        right:0px;
        z-index:2;
        width:100%;
      } 
    `]  
})
export class ChatComponent implements OnInit {

  @ViewChild('msgs') private scroller:ElementRef;
  @ViewChild('chatOptions') private chatOptions:ElementRef;
  @ViewChild('chatFilter') private chatFilter:ElementRef; 
  
  sending=false;
  tooltipText:'Copy to clipboard'|'Copied!'='Copy to clipboard';

  styleObject(): Object {
       if (this.groupCreationStage=='second'){
           return {top: '0%',height: '100%'};
       }
       return {};
  }

  closeChatBox() {
    let t:HTMLElement=document.querySelector('#chatBox');
    t.style.display='none';
  }

  mainClk(event) {
    if(event.target.id!='chatOptionsBtn') {
      this.chatOptions.nativeElement.style.display='none';
    }
    else {
      this.chatOptions.nativeElement.style.display='block';
    }
    if(this.chatFilter) {
      if(event.target.id!='chatFilter') {
        this.chatFilter.nativeElement.style.display='none';
      }
      else {
        this.chatFilter.nativeElement.style.display='block';
      }
    } 
  }

  /* background variables*/
  bgY:'center'|'bottom'|'top'='center';
  edit=false; 
  bgFile:File;  //background file
  
  groupCreationStage:'first'|'second'='first'; //which stage of creation of groupCreationStage 
  view:'main'|'groups'|'create'|'discussions'='groups'; //which view to view
  
  message=''; //group message buffer
  file:File; //any temp. file ref

  messageType:'blob'|'post'|'upload'|'group'|'message'='message';
  
  constructor(
    private cs: ChatService,
    private db:AngularFirestore,
    private ps:PoolService,
    private auth:AuthService,
  ) {}

  ngOnInit(): void {    
    this.friendsSearchResult$ = this.friendSearchTerms.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term: string) => this.searchFriends(term)),
    );
  } 

  /* all about searching friends */
  
  search(term: string): void {  this.friendSearchTerms.next(term); }

  private friendSearchTerms = new Subject<string>();
  friendsSearchResult$:Observable<Array<User>>;

  searchFriends(term: string):Observable<Array<User>> {

    let friendFilter=(users:Array<User>)=> { 
      return users.filter((user) =>user.name.includes(term))
    };
    //if (!term.trim()) {  return of([]); }
    return this.ps.friendsObject$.pipe(map(friendFilter));
  }
  //-----------------------------------------------------------------------



//if valid image file, bgFile will change
  encodeImage(element) {
    let file=element.target.files[0];
    if(file) {
      let reader:FileReader=encodeImageToUrl.bind(this)(file);
      if(!reader) {
          (<Group>this.currChat).image='';
          this.bgFile=null;  
      }
      else 
        reader.onloadend=()=>{
          (<Group>this.currChat).image=<string>reader.result;   
          this.bgFile=file;
        };
    }
  }

  moveBG(val) {
    switch(val) {
      case 'u': if(this.bgY=='center') this.bgY='top'; else this.bgY='center'; break;
      case 'd': if(this.bgY=='center') this.bgY='bottom'; else this.bgY='center';
    }
  }

  editBG() {
    this.edit=!this.edit;
  }  

  scrollTo(id) {
      let x=document.querySelector('#'+id);
      x.scrollIntoView({behavior: "smooth"}); 
  }


  /* all related to showcase the current chat view */
  msgsEnd=false;  //dont scroll more to the top if msgs compete
  firstMsgID='';  //id of first msg in set of current result 25,50,75..
  counter=1;    //counter multiplies with 25 to emit 25,50,75...
  showNewMsgsArrived=false; //show new message div
  scrollIndex;  //msg that will be srolled to after new msgs arrival from 'top'
  showMsgScroller=false;  //show that little button on right bottom for scrollToEnd
  doScroll; //wanna scroll if new msg arrive, if scroll is at bottom then true
  showMessagesFrom ='All';  //helps in filtering, string is 'All' or username
  userFilterWorked=false; //prevents showNewMsgsArrived from showing up 
  isScrollatEnd=true; //is scroll at end
  lastMsgID;  //last msg at bottom
  currChat:Discussion|Group; //current Chat in view
  currChatSubs:Subscription;
  chatType:'groups'|'discussions'='groups'; //view list. Also used for collection name
  
  discussionTitle=''; //binding
  groupTitle=''; //binding
  currentMessagesSubs:Subscription; //curr chatType msg subs
  currMsgs:Array<Discussion|Group>; //curr chatType messages
  selectedUsers:Array<User>=[]; //users selected for joining new group
  groupInfo=false;  //toggle between groupCreationStage='second' : creating or about
  percent$:Observable<number>;  //percentage obs

  image:string; //image buffer
  dataID:string; //previous dataID pasted <4><4>

  //refreshes back to normal at 25 msgs
  restateNewMsg(filterWorked=false) {
     this.counter=1;
     this.firstMsgID='';
     this.userFilterWorked=filterWorked;
     this.getMsgs(true);
  }

  ngAfterViewInit() {
    this.scroller.nativeElement.addEventListener('scroll',()=>{
      let w=this.scroller.nativeElement.scrollTop;
      let t=this.scroller.nativeElement.clientHeight
      let z=this.scroller.nativeElement.scrollHeight;
      if((t+w)==z) {  //to the bottom
        this.showNewMsgsArrived=false;
        this.showMsgScroller=false;
        if(this.counter>1) { 
          if(this.showMessagesFrom=='All')
            this.restateNewMsg();
           else this.restateNewMsg(true);
        }
      } 
      else {
        this.showMsgScroller=true;
      }
      if(w==0) {  //to the top
        if(this.msgsEnd) return;
        this.doScroll=true;
        this.getMsgs();
      }
    });
    setTimeout(()=>this.friendSearchTerms.next(""),200);    
  }
  
  chatWith(chat,type="groups") {
    (<string>this.chatType)=type;
    this.currChat=chat; //not real time
    if(this.currChatSubs) this.currChatSubs.unsubscribe();
    this.currChatSubs=this.db.collection(this.chatType).doc(chat.id).valueChanges()
    .subscribe((data:Group|Discussion)=>{
      this.currChat=data;
    });
    this.restateNewMsg();
    this.view='main';
  }

  //init tells to reset to 25 or not
  getMsgs(init=false) {
      if(this.currentMessagesSubs) this.currentMessagesSubs.unsubscribe();
      if(!init) this.counter+=1;

      let query=(ref:Query) => { 
        let t=ref.orderBy("id","desc");
        if(this.showMessagesFrom=='All') return t.limit(25*this.counter);
        else return t.where("name", "==", this.showMessagesFrom).limit(25*this.counter);
      };

      this.currentMessagesSubs=this.db.collection(this.chatType).doc(this.currChat.id)
      .collection("msgs", query).valueChanges()
      .subscribe((data:Array<Discussion|Group>)=>{

        if(!data.length) {this.currMsgs=null; return;} 
        let t=this.scroller.nativeElement.clientHeight
        let w=this.scroller.nativeElement.scrollTop;
        let z=this.scroller.nativeElement.scrollHeight;
        data.reverse();
        if(this.firstMsgID==data[0].id)  this.msgsEnd=true;
        else this.msgsEnd=false;
        
        let l=data.length;
        this.scrollIndex=this.counter>1?((l-25)>0?25:(l-1)):(l-1);
        let lastMsgID='n'+data[data.length-1].id; 
        if((t+w)!=z) {
          this.isScrollatEnd=false;
          if(this.lastMsgID!=lastMsgID) this.showNewMsgsArrived=true;   
        }
        if(this.doScroll && !this.msgsEnd) {
             this.doScroll=false; this.isScrollatEnd=true;
        }
        if(this.userFilterWorked&&this.showMessagesFrom=='All') {
           this.showNewMsgsArrived=false;
           this.userFilterWorked=false;
        }   
        this.lastMsgID=lastMsgID;
        this.firstMsgID=data[0].id;
        this.currMsgs=data;
      });  
  }

  back() {
    this.msgsEnd=false;
    this.showNewMsgsArrived=false;
    this.showMsgScroller=false;
    this.showMessagesFrom='All';
    this.isScrollatEnd=true;
    this.scroller.nativeElement.scrollTop=this.scroller.nativeElement.scrollHeight; 
    this.view=this.chatType;
  }

  aboutChat(val='') {
    if(val=='close') {  
      this.groupTitle='';
      this.groupCreationStage='first';
      this.view='main';
      this.groupInfo=false;
      this.bgY='center';
      return false;
    }
    if(this.groupInfo) return false;
    this.groupInfo=true;
    this.groupTitle=this.currChat.title;
    (<string>this.bgY)=(<Group>this.currChat).bgY;
    this.groupCreationStage='second';
    return false;
  }

  sendMessage() {
    if(this.messageType=='message' && !this.message.trim()) return;
    this.sending=true;
    
    let t=this.cs.sendMessage(
      this.messageType,this.chatType, this.currChat,this.file,this.dataID
    );
    if(t instanceof Promise) {
      t.then(()=>{
        this.message='';  this.removeData();  this.sending=false;      
      })
      .catch((error)=> {
        this.sending=false;  console.log(error.message);
      });
    }
    else if(t instanceof Observable){
      t.pipe(take(1)).subscribe((prom)=>{
          prom.then(()=>{
            this.message='';  this.removeData();  this.sending=false;      
          })
          .catch((error)=> {
            this.sending=false;  console.log(error.message);
          });
      });
    }
  }
  
  removeData() {
    this.file=null;
    this.image='';
    this.messageType='message';
    this.dataID='';
  }

  pushIntoSelectedUser(user:User) {
    let flag:boolean;
    for(let i of this.selectedUsers) {
      if(user.id==i.id) {
        flag=true; break;
      }
    }
    if(flag) return;
    this.selectedUsers.push(user);
  }

  removeFromSelectedUser(i:number) {
    this.selectedUsers.splice(i, 1);
  }

  createDisc() {
    this.sending=true;
    this.cs.createDiscussion(this.discussionTitle,<Group>this.currChat)
    .then(()=>{
        this.discussionTitle='';
        this.sending=false;
        this.aboutChat('close');
        this.view='discussions';
      })
      .catch((error)=>{
        console.log("createDisc (cser:requestDisc): "+error.message);
   });
  }  

  createChat() {
    this.sending=true;
    let t=this.cs.createChat(
      <Group>this.currChat, this.groupInfo, this.selectedUsers,
      this.bgFile, this.bgY, this.groupTitle
    );
    if(t instanceof Promise) {
      t.then(()=>{
        common.bind(this)();
      })
      .catch((error)=>{
          console.log("createChat (promise-all): "+error.message);
      });
    }
    else if(t instanceof Observable){
      t.pipe(take(1)).subscribe((prom)=>{
        prom.then(()=>{
          common.bind(this)();
        })
        .catch((error)=>{
            console.log("createChat (promise-all): "+error.message);
        });
      });
    } 
    
    function common() {
      this.selectedUsers=[];
      this.groupTitle='';
      this.sending=false;
      this.edit=false;
      this.bgY='center';
      this.groupCreationStage='first';
      this.bgFile=null;
      this.view=this.groupInfo?'main':'groups';
      this.groupInfo=false;
    }
    
  }

  paste(event:any) {
      let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
      let blob = null;
      if(items.length && items[0].type.indexOf("image") === 0) {
         blob = items[0].getAsFile();
         if (blob !== null) {
           this.file=blob;
           this.messageType='blob';      
           let reader = new FileReader();
           reader.onload = (event:any)=> {
             this.image = event.target.result;   //fill image buffer 
           };
           reader.readAsDataURL(blob);
         }
      }
      else {
          setTimeout(()=>{  //run this in next tick so that to get event.target.value
            let t=event.target.value.split(":");
            this.message='';
            if(t[1]==this.dataID) return; //same share code id pasted
            this.dataID=t[1];
            if(t[0]=='post')  this.messageType='post';              
            else if(t[0]=='upload')  this.messageType='upload';
            else if(t[0]=='group')  this.messageType='group';
            else this.messageType='message';
          },0);
      }
  }

  gotoFirst() {
    setTimeout(()=>this.friendSearchTerms.next(""),0);
    this.groupCreationStage='first';
  }
  gotoSecond() {
    this.image=null;
    this.groupCreationStage='second';
  }

  copyToClipboard() {  //copy groupid to clipboard
   copyToClipboard('group:'+ this.currChat.id);
   return false; 
  }

}  