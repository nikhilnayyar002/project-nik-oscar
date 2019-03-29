import { Component} from '@angular/core';
import { take } from 'rxjs/operators';
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


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
export class UserComponent  {
 

  user:User;
  postsObject$:Observable<Array<Post>>;
  uploadsObject$:Observable<Array<Upload>>;
  makeSubs:Subscription;

  option='';
  status:("?"|"send-request"|"cancel-request"|"un-friend")="?";

  ngOnInit() {
      this.main();  
  }

  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ps:PoolService,
    private auth:AuthService,
    private fs:FriendService
    ) {} 

  main() {
    
    this.route.paramMap.pipe(takeWhileAlive(this)).subscribe((params: ParamMap) => {
       //get id
       let uid=params.get('id');
       if(this.router.url==`/info/users/${uid}`) this.option='general';

       //get posts and uploads
       this.postsObject$=this.ps.getPostsObject(uid).pipe(map(datas=>datas.reverse()));
       this.uploadsObject$=this.ps.getUploadsObject(uid).pipe(map(datas=>datas.reverse()));
       //get user
       this.ps.users$.pipe(this.ps.rtnDefaultIDFilter(uid),take(1)).subscribe((users)=>{
          if(users.length) {
            this.user=users[0];
          }
          else this.user=null;
       });

       //check status
        if(uid!=this.auth.user.id) {
          this.ps.friendsString$.pipe(take(1)).subscribe((friends:{datas:Array<string>})=>{

            const data=friends.datas.filter((UID:string) => UID==uid);
            if(data.length>0) this.status="un-friend";
            else {
              if(this.makeSubs) this.makeSubs.unsubscribe();
              this.makeSubs=this.ps.makeString$.subscribe((data:{datas:Array<Map<string,string>>;})=>{
                let flag=false;
                for(const i of data.datas) {
                  if(i.get('id')=='uid')  {
                    flag=true; break;
                  }
                }  
                if(flag) this.status="cancel-request";
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
    if(this.makeSubs) this.makeSubs.unsubscribe();
  }
}

