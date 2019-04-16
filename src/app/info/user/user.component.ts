import { Component, ViewChild, ElementRef} from '@angular/core';
import { take, takeLast, last, takeWhile } from 'rxjs/operators';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { ActivatedRoute , ParamMap, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { PoolService } from 'src/app/pool.service';
import { User } from 'src/app/model/user';
import { Post } from 'src/app/model/post';
import { Upload } from 'src/app/model/upload';
import { AuthService } from 'src/app/auth.service';
import { FriendService } from 'src/app/friend.service';
import { NotifType } from 'src/app/shared/global';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
export class UserComponent  {
 
  @ViewChild('bgImageElement') private bgImageElement:ElementRef;

  user:User;
  postsObject$:Observable<Array<Post>>;
  uploadsObject$:Observable<Array<Upload>>;
  friendsObject$:Observable<Array<User>>;  
  makeSubs:Subscription;
  makeSubs0:Subscription;

  option='';
  status:("?"|"send-request"|"cancel-request"|"un-friend")="?";
  selected='';
  buffer:[]; //buffer

  ngOnInit() {
      this.main();  
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ps:PoolService,
    private auth:AuthService,
    private fs:FriendService
    ) {
      window.onresize=this.bgResize.bind(this);
  } 

  bgResize() {
      let t=this.bgImageElement.nativeElement.clientWidth;
      this.bgImageElement.nativeElement.style.height=t/2.5+'px';
  }

  ngAfterViewInit(): void {
    this.bgResize();
  }

  main() {
    
    this.route.paramMap.pipe(takeWhileAlive(this)).subscribe((params: ParamMap) => {
       //get id
       let uid=params.get('id');
       if(this.router.url==`/info/users/${uid}`) this.option='general';

       //get posts and uploads
       this.postsObject$=this.ps.getPostsObject(uid).pipe(map(datas=>datas.reverse()));
       this.uploadsObject$=this.ps.getUploadsObject(uid).pipe(map(datas=>datas.reverse()));
       this.friendsObject$=this.ps.getFriendsObject(uid);
       //get user 
       this.ps.users$.pipe(this.ps.rtnDefaultIDFilter(uid),takeWhile(datas=>datas.length<2)).subscribe((users)=>{
          if(users.length) {
            this.user=users[0];
          }
          else this.user=null;
       });

       //check status
        if(uid!=this.auth.user.id) {
          if(this.makeSubs0)  this.makeSubs0.unsubscribe();
          this.makeSubs0=this.ps.friendsString$.subscribe((friends:{datas:Array<string>})=>{
            const data=friends.datas.filter((UID:string) => UID==uid);
            if(data.length>0) this.status="un-friend";
            else {
              console.log('a');
              if(this.makeSubs) this.makeSubs.unsubscribe();
              this.makeSubs=this.ps.getMakeString(uid).subscribe((data:{datas:Array<{id:string; type:string;}>;})=>{
                if(data && data.datas.length) {
                  let flag=false;
                  for(const i of data.datas) {
                    if(i.id==this.auth.user.id && i.type==NotifType.FriendRequest)  {
                      flag=true; break;
                    }
                  }  
                  if(flag) this.status="cancel-request";
                  else this.status="send-request";
                }
                else this.status="send-request";
              });
            }

          });
        }
        else this.status='?';
        
      });    
  }


  friendBtn() {
    if(!this.user) return;

    if(this.status=="send-request") 
      this.fs.request(this.user.id);
    
    else if(this.status=="un-friend")
      this.fs.unFriend(this.user.id);   
    
    else if(this.status=="cancel-request") 
      this.fs.unRequest(this.user.id);   
      
  }

  ngOnDestroy(): void {
    if(this.makeSubs0)  this.makeSubs0.unsubscribe();
    if(this.makeSubs) this.makeSubs.unsubscribe();
    window.onresize=null;
  }
}

