import { Component} from '@angular/core';
import { DomSanitizer,SafeStyle} from '@angular/platform-browser';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { SignInCheckService} from '../../sign-in-check.service';
import { FormControl } from '@angular/forms';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { ActivatedRoute , ParamMap, Router} from '@angular/router';
import { switchMap,map ,skipWhile} from 'rxjs/operators';
import { PostService} from '../../post.service';
import { Subscription } from 'rxjs';
import { AngularFirestore} from '@angular/fire/firestore';
import { FriendService} from '../../friend.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
export class UserComponent  {
 
  bgImage:SafeStyle|string="";
  image='assets/images/no-user.png';
  bgSize='cover';
  user;
  subs:Subscription;
  uploadsSubs:Subscription;
  postsSubs:Subscription;
  friendsSubs:Subscription;
  option='';
  posts;
  uploads;
  status:("?"|"send-request"|"cancel-request"|"un-friend")="?";

  ngOnInit() {
      this.main(this.auth.user.uid);    
  }

  main(id) {
    type User={uid:string;image:string;privacy:{show_image:boolean;};name:string;};
    this.route.paramMap.pipe(takeWhileAlive(this)).subscribe((params: ParamMap) => {
       let uid=params.get('id');
       if(this.router.url==`/info/users/${uid}`) this.option='general';
       let userFilter=(users:Array<User>)=> { return users.filter((user:User) =>user.uid==uid)};
       if(this.subs) {
        this.friendsSubs?this.friendsSubs.unsubscribe():'';
        this.postsSubs.unsubscribe();
        this.uploadsSubs.unsubscribe();
        this.subs.unsubscribe();
       }      //skipWhile((val:[]) => val.length<2),
       this.subs=this.ps.users$.pipe(map(userFilter)).subscribe(({
        next:(users)=>{
          if(users && users.length) {
            this.user=users[0];
          if(this.user.bgImage)
            this.bgImage=this.sanitizer.bypassSecurityTrustStyle(`url(${this.user.bgImage}) no-repeat center`);
          else 
              this.bgImage='black';
          this.bgSize='contain';setTimeout(()=>{this.bgSize='cover'},0);
          if(this.user.image)
            this.image=this.user.image;
          else 
              this.image='assets/images/no-user.png' ;

          this.postsSubs=this.db.collection("users").doc(this.user.uid).collection("others").doc("posts").valueChanges().pipe(takeWhileAlive(this)).subscribe((data:{datas:[];names:[];})=>{
            data.datas.reverse();
            data.names.reverse();
            this.posts=data;
          });  

          this.uploadsSubs=this.db.collection("users").doc(this.user.uid).collection("others").doc("uploads").valueChanges().pipe(takeWhileAlive(this)).subscribe((data:{datas:[];names:[];})=>{
           data.datas.reverse();
           data.names.reverse(); 
           this.uploads=data;
          }); 
          if(id!=uid) {
            this.friendsSubs=this.fserv.friends$.pipe(takeWhileAlive(this)).subscribe({
                 next:(datas:{datas:[];})=>{
                    const data:Array<string>=datas.datas.filter((UID:string) => UID==uid);
                    if(data.length>0) this.status="un-friend";            
                    else {
                      let temp=this.fserv.make_friends$.subscribe({
                          next:(datas:{friends_req:Array<string>;friends_conf:Array<string>;friends_req_rec:Array<string>;})=>{
                              let data=datas.friends_req.filter((UID:string) => UID==uid);
                              if(data.length>0) this.status="cancel-request";
                              else this.status="send-request";
                          }
                      });
                    }
                 }
            }); 
           }
           else this.status="?";
          }
          else {
            this.user=null;
            this.posts=null;
            this.uploads=null;
            this.image='assets/images/no-user.png' ;
            this.bgImage='black';
          }
        }
       }));

    });


  }


  friendBtn() {
       //  status:("?"|"send-request"|"cancel-request"|"un-friend")="?";
    if(this.status=="send-request") {
      this.status="?";
      this.fserv.request(this.user.uid);
    } 
    else if(this.status=="un-friend") {   
      this.status="?";
      this.fserv.unFriend(this.user.uid);   
    }
    else if(this.status=="cancel-request") {   
      this.status="?";
      this.fserv.unRequest(this.user.uid);   
    }   

  }

  constructor(private fserv:FriendService, private router: Router, private db:AngularFirestore, private ps:PostService, private route: ActivatedRoute, private auth:SignInCheckService,private storage: AngularFireStorage,private sanitizer: DomSanitizer) {
   	 this.bgImage='black'; 

  }
  ngOnDestroy() {
  }
}

