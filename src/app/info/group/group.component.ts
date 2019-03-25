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
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
export class GroupComponent {
 
  bgImage:SafeStyle|string="";
  bgSize='cover';
  group;
  groupSubs;
  option='';

  fin:Subscription;
  
  ngOnInit() {
    this.route.paramMap.pipe(takeWhileAlive(this)).subscribe((params: ParamMap) => {
       let gid=params.get('id');
       if(this.router.url==`/info/groups/${gid}`) this.option='general';
       if(this.groupSubs) this.groupSubs.unsubscribe();
       this.groupSubs=this.db.collection('chats').doc(gid).valueChanges()
       .pipe(takeWhileAlive(this)).subscribe((data:any)=>{	
       	 this.group=data;
       	 if(data) {
          	 if(data.image)
             	this.bgImage=this.sanitizer.bypassSecurityTrustStyle(
             		`url(${data.image}) no-repeat center`
             	);
          	 else 
                this.bgImage='black';
          	 this.bgSize='contain';
          	 setTimeout(()=>{this.bgSize='cover'},0);

       	 }
       	 else {
            this.bgImage='black';
         }
       });
    });
    
  }

  constructor(private fserv:FriendService, private router: Router, private db:AngularFirestore, private ps:PostService, private route: ActivatedRoute, private auth:SignInCheckService,private storage: AngularFireStorage,private sanitizer: DomSanitizer) {
   	 this.bgImage='black'; 

  }

}








