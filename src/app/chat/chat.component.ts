import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject ,of} from 'rxjs';
import { skipLast, debounceTime, map,distinctUntilChanged, switchMap, finalize} from 'rxjs/operators';
import { PostService} from '../post.service';
import { SignInCheckService} from '../sign-in-check.service';
import { AngularFirestore,Query} from '@angular/fire/firestore';
import { ChatService } from '../chat.service';
import { AngularFireStorage } from '@angular/fire/storage';
import{DomSanitizer,SafeStyle} from '@angular/platform-browser';


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

  users$;
  private searchTerms = new Subject<string>();

  friends=[]; 
  fsubs;
  csubs;

  chats$; 
  currMsgsSubs;
  currMsgs;
  currChat$;

  bgImage:SafeStyle|string="";
  bgSize='cover';
  bgY='center'; bgY_old;
  edit=false;
  groupChat='first';
  file_BG;

  display='chats';
  sending=false;
  msg='';
  img='';
  file;
  type='message';
  percent='';
  tooltipText='Copy to clipboard';

  data;
  dataID;
  dataSubs;
  tempStr;

  selectedUsers=[];
  chatTitle='';
  groupInfo=false;

  showChatsFrom='All';
  userFilterWorked=false;

  isScrollatEnd=true;
  lastMsgID;

  chatType='chats';
  discTitle='';
  discussions;
  discussionsSubs;
  currChatDiscussions;
  userDiscFilter=(data:any)=>data.chat_id==this.currChat.id;

/*
  createTemplateFilter(arr) {
    function func(datas:Array<{id:string;}>) {
      let i=0,j=0,rtnArr=[],l=datas.length;
      while(i<l) {
        while(arr[i]!=datas[j].id)
          ++j;
        rtnArr.push(datas[j]);
        ++i;++j;
      }
      return rtnArr;
    } 
    return func;
  }
*/

  styleObject(): Object {
       if (this.groupChat=='second'){
           return {top: '0%',height: '100%'};
       }
       return {}
  }

  closeChatBox() {
    let t:HTMLElement=document.querySelector('#chatBox');
    t.style.display='none';
  }

  constructor(private storage: AngularFireStorage, private cser: ChatService, private db:AngularFirestore, private ps:PostService, private auth:SignInCheckService,private sanitizer: DomSanitizer) {}
  ngOnInit(): void {    
    this.csubs=this.auth.check.subscribe({  //for safety
         next:(result)=>{
            if(result) {
              this.fsubs=this.db.collection("users").doc(result.uid).collection("others")
              .doc("friends").valueChanges().subscribe((data:{datas:Array<string>;})=>{
                this.friends=data.datas;
              });
              this.chats$=this.db.collection("users").doc(result.uid).collection("others").doc("chats").valueChanges();
              this.discussionsSubs=this.db.collection("discussions")
                  .valueChanges().subscribe((data)=>{this.discussions=data;});
              this.users$ = this.searchTerms.pipe(
                // wait 300ms after each keystroke before considering the term
                debounceTime(300),
 
                // ignore new term if same as previous term
                distinctUntilChanged(),
 
                // switch to new search observable each time the term changes
                switchMap((term: string) => this.searchUsers(term)),
              );
            }
         }   

    });
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

  encodeImageFileAsURL(element) {
    let fileTypes = ['jpg','jpeg','png','gif','svg','ico','bmp'];
    let file=element.target.files[0];
    let reader = new FileReader();
    if(file) {     
      let extension = file.name.split('.').pop().toLowerCase(); 
      let isSuccess = fileTypes.indexOf(extension) > -1;
      if (isSuccess) {
          reader.onloadend = ()=>{
                this.bgImage=<string>reader.result;
                this.bgImage=this.sanitizer.bypassSecurityTrustStyle(`url(${this.bgImage}) no-repeat center`);
                this.bgSize='contain';setTimeout(()=>{this.bgSize='cover'},0);     
                this.file_BG=file;
          };
          reader.readAsDataURL(file);
      }
      else {
          this.bgImage='';
          this.file_BG=null;  
      }
    } 
  }

  moveBG(val) {
    let i=20;
    if(this.bgY=='center') this.bgY='0px';
    switch(val) {
      case 'u': this.bgY=(parseInt(this.bgY)-i)+'px'; break;
      case 'd': this.bgY=(parseInt(this.bgY)+i)+'px'; break;
    }
  }

  editBG() {
    this.edit=!this.edit;
    if(!this.edit) this.bgY_old=this.bgY;
  }

  /*
  ngAfterViewChecked() {
      this.scrollToBottom();  
  }
  scrollToBottom() {
    this.scroller.nativeElement.scrollTop
      =this.scroller.nativeElement.scrollHeight;
  }
  */

  scrollTo(id) {
      let x=document.querySelector('#'+id);
      x.scrollIntoView({behavior: "smooth"}); 
  }
 
  msgsEnd=false; firstMsgID=''; counter=1; showNewMsgsArrived=false;
  scrollIndex;showMsgScroller=false;currChat;doScroll;

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
      if((t+w)==z) {
        this.showNewMsgsArrived=false;
        this.showMsgScroller=false;
        if(this.counter>1) { 
          if(this.showChatsFrom=='All')
            this.restateNewMsg();
           else this.restateNewMsg(true);
        }
      } 
      else {
        this.showMsgScroller=true;
      }
      if(w==0) {
        if(this.msgsEnd) return;
        this.doScroll=true;
        this.getMsgs();
      }
    });
    setTimeout(()=>this.searchTerms.next(""),200);     
  }
  
  chatWith(chat,type="chats") {
    this.chatType=type;
    this.currChat=chat;
    this.currChat$=this.db.collection(this.chatType).doc(chat.id).valueChanges();
    this.restateNewMsg();
    this.display='main';
  }

  getMsgs(init=false) {
      if(this.currMsgsSubs) this.currMsgsSubs.unsubscribe();
      if(!init) this.counter+=1;
      let query=(ref:Query) => { 
        let t=ref.orderBy("id","desc");
        if(this.showChatsFrom=='All') return t.limit(25*this.counter);
        else return t.where("name", "==", this.showChatsFrom).limit(25*this.counter);
      };
      this.currMsgsSubs=this.db.collection(this.chatType).doc(this.currChat.id).collection("msgs", query)
      .valueChanges().subscribe((data:Array<{id:string;}>)=>{
        if(!data.length) {this.currMsgs=null; return;} 
        let t=this.scroller.nativeElement.clientHeight
        let w=this.scroller.nativeElement.scrollTop;
        let z=this.scroller.nativeElement.scrollHeight;
        data.reverse();
        if(this.firstMsgID==data[0].id) {
            this.msgsEnd=true;
        }
        else {
            this.msgsEnd=false;
        }
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
        if(this.userFilterWorked&&this.showChatsFrom=='All') {
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
    this.showChatsFrom='All';
    this.isScrollatEnd=true;
    this.scroller.nativeElement.scrollTop=this.scroller.nativeElement.scrollHeight; 
    this.display=this.chatType;
  }

  aboutChat(val='') {
    if(val=='close') {
      this.bgImage='';    
      this.chatTitle='';
      this.groupChat='first';
      this.display='main';
      this.groupInfo=false;
      this.bgY='center';
      return false;
    }
    if(this.groupInfo) return false;
    this.groupInfo=true;
    let t=this.currChat$.subscribe((currChat:{image:string;name:string;bgY:string;})=>{
      this.bgImage=currChat.image;
      this.bgImage=this.sanitizer.bypassSecurityTrustStyle(`url(${this.bgImage}) no-repeat center`);
      this.bgSize='contain';setTimeout(()=>{this.bgSize='cover'},0);     
      this.chatTitle=currChat.name;
      this.bgY=currChat.bgY;
      this.groupChat='second';
      this.display='create';
      t.unsubscribe();
    });
    return false;

  }

  send() {
    if(this.type=='message' && !this.msg.trim()) return;
    this.sending=true;
    let datet=new Date();  
    let msgId=datet.getTime()+this.auth.user.uid.slice(0, 4);

    if(this.type=='blob' && this.file) {

       let type=this.chatType=='chats'?'chat':'discussion';
       let filePath =`${type}/${this.currChat.id}/${msgId}/${this.file.name}`;
       let fileRef=this.storage.ref(filePath);
       const task = this.storage.upload(filePath, this.file);
       let uploadPercent = task.percentageChanges().subscribe((value)=>{this.percent=`${Math.round(value)}%`;});
       let t=task.snapshotChanges().pipe(finalize(()=>{  
          let g=fileRef.getDownloadURL().subscribe((url)=>{
           uploadPercent.unsubscribe();
           g.unsubscribe();
           sendMsg.bind(this)(url);
          });
       })).subscribe();
    }
    else sendMsg.bind(this)(this.data?this.data:'');

    function sendMsg(url) {
      let msg={
          uid:this.auth.user.uid,
          name:this.auth.user.name,
          date:datet,
          type:this.type,
          msg:this.msg,
          data:url,
          id:msgId
      };

      this.db.collection(this.chatType).doc(this.currChat.id).collection("msgs").doc(msgId).set(msg)
      .then(()=>{
        this.msg='';
        this.removeData();
        this.sending=false;      
      })
      .catch((error)=> {
        this.sending=false;
        console.log(error.message);
      });
    }  

  }

  push(user) {
    let flag;
    for(let i=0;i<this.selectedUsers.length;++i) {
      if(user.uid==this.selectedUsers[i].uid) {
        flag=true;break;
      }
    }
    if(flag) return;
    this.selectedUsers.push(user);
  }

  remove(i) {
    this.selectedUsers.splice(i, 1);
  }

  createDisc() {
    this.sending=true;
    let discID=(new Date()).getTime()+this.auth.user.uid.slice(0,4);
    let gObj={title:this.discTitle,id:discID};
    this.cser.requestDisc(gObj,this.currChat)
      .then(()=>{
        this.discTitle='';
        this.sending=false;
        //this.display=this.groupInfo?'main':'chats';
        //this.groupInfo=false;
      })
      .catch((error)=>{
        console.log("createDisc (cser:requestDisc): "+error.message);
      });
  }  

  createChat() {
    this.sending=true;
    let t=[],chatID;

    if(!this.groupInfo) {
     for(let i=0;i<this.selectedUsers.length;++i) {
      t[i]=this.selectedUsers[i].uid;
     }
     chatID=(new Date()).getTime()+this.auth.user.uid.slice(0,4);
    }
    else {
       chatID=this.currChat.id;
    }

    if(this.file_BG) { 

       let filePath=`group/${this.groupInfo?this.currChat.id:chatID}/${this.groupInfo?this.currChat.file_name:this.file_BG.name}`;
       let fileRef=this.storage.ref(filePath);
       const task = this.storage.upload(filePath, this.file_BG);  
       let t=task.snapshotChanges().pipe(finalize(()=>{
          let g=fileRef.getDownloadURL().subscribe((url)=>{
           g.unsubscribe(); 
           createReq.bind(this)(url);
          });
       })).subscribe();
    }
    else createReq.bind(this)('');


    function createReq(url) {
      if(this.groupInfo && !url) url=this.currChat.image;
      let gObj={bgY:this.bgY,file:this.file_BG,title:this.chatTitle,url:url,id:chatID};

      this.cser.request(t,gObj,this.groupInfo)
      .then(()=>{
        this.selectedUsers=[];
        this.chatTitle='';
        this.sending=false;
        this.edit=false;
        this.bgImage='';
        this.bgY='center';
        this.groupChat='first';
        this.file_BG=null;
        this.display=this.groupInfo?'main':'chats';
        this.groupInfo=false;
      })
      .catch((error)=>{
        console.log("createChat (promise-all): "+error.message);
      });

    }  

  }
 
  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }
 
 searchUsers(term: string) {
  let userFilter=(users:Array<{name:string;uid:string;}>)=> { 
    return users.filter((user:{name:string;}) =>user.name.includes(term))
  };
  let friendFilter=(users:Array<{uid:string;name:string;}>)=> { 
    return users.filter((user:{uid:string;}) =>this.friends.includes(user.uid))
  };
  //if (!term.trim()) {  return of([]); }
  return this.ps.users$.pipe(map(userFilter),map(friendFilter));
 }

 paste(event:any) {
      let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
      let blob = null;

      if (items[0].type.indexOf("image") === 0) {
         blob = items[0].getAsFile();
         if (blob !== null) {
           this.file=blob;
           this.type='blob';       
           let reader = new FileReader();
           reader.onload = (event:any)=> {
             this.img = event.target.result;    
           };
           reader.readAsDataURL(blob);
         }
      }
      else {
          setTimeout(()=>{ 
            let t=event.target.value.split(":");
            this.msg='';
            if(t[1]==this.dataID) return;
            this.dataID=t[1];
            function func(datas:Array<{id:string;}>) {
                return datas.filter((data)=>data.id==t[1]);
            }  
            if(this.dataSubs) this.dataSubs.unsubscribe();
            if(t[0]=='post') {
              this.type='post';
              this.dataSubs=this.ps.getAllPosts(func).subscribe({next:(datas)=>{
                this.data=datas[0];
                this.dataSubs.unsubscribe();
              }});             
            }
            else if(t[0]=='upload') {
              this.type='upload';
              this.dataSubs=this.ps.getAllUploads(func).subscribe({next:(datas)=>{
                this.data=datas[0];
                this.dataSubs.unsubscribe();
              }});
            } 
            else if(t[0]=='group') {
              this.type='group';
              this.tempStr=t[1];
            }             
          },0);
      }
 }

  shareGroup() {
      this.type='group';
      this.data=this.currChat;
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

 removeData() {
  if(this.dataSubs) this.dataSubs.unsubscribe();
  this.file=null;
  this.img='';
  this.type='message';
  this.data=null;
  this.dataID='';
 }

 gotoFirst() {
  setTimeout(()=>this.searchTerms.next(""),0);
  this.groupChat='first'
 }

 copyToClipboard() {

  let textArea = document.createElement("textarea");
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  textArea.value = 'group:'+ this.currChat.id;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy'); //let successful
    this.tooltipText='Copied';
  } catch (err) {
    console.log('Oops, unable to copy');
  }
  document.body.removeChild(textArea);
  return false; 
 }

 getChat(id) {
  this.data=this.ps.getChat(id);
  return this.data;
 }

  ngOnDestroy() {
    if(this.csubs) this.csubs.unsubscribe();
    if(this.fsubs) this.fsubs.unsubscribe();
    if(this.discussionsSubs) this.discussionsSubs.unsubscribe();

  }

}  