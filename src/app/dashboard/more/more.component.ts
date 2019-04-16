import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { AuthService } from 'src/app/auth.service';
import { Observable } from 'rxjs';
import { Post } from 'src/app/model/post';
import { Upload } from 'src/app/model/upload';
import { PoolService } from 'src/app/pool.service';
import { Template } from 'src/app/model/template';
import { Group } from 'src/app/model/group';
import { User } from 'src/app/model/user';

@Component({
  selector: 'app-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.scss']
})
export class MoreComponent {

  msg="";
  display="";

  shortenArrow='keyboard_arrow_left';
  mediaQueryFunc1;
  matchMediaOBject:MediaQueryList;

  postsObject$:Observable<Array<Post>>;  //user posts:array strings mapped to array posts
  uploadsObject$:Observable<Array<Upload>>;  //user uploads:array strings mapped to array uploads
  friendsObject$:Observable<Array<User>>; //user friends:array strings mapped to array users$
  chatsObject$:Observable<Array<Group>>; //user groups:array strings mapped to array groups
  templatesObject$:Observable<Array<Template>>;  //user templates:array strings mapped to array templates
  data:{iam:string;};

  constructor(
    private ps:PoolService,
    private auth:AuthService,
    private db: AngularFirestore
    ) {
    this.postsObject$=this.ps.posts$;
    this.uploadsObject$=this.ps.uploadsObject$;
    this.friendsObject$=this.ps.friendsObject$;
    this.chatsObject$=this.ps.chatsObject$;
    this.templatesObject$=this.ps.templatesObject$;
  }

  shortenClick() {
   let right:HTMLElement=document.querySelector('.right');
   if(right.style.gridColumn=='2 / span 1') {
    right.style.gridColumn=' 1/span 2';
    this.shortenArrow='keyboard_arrow_right';
   }
   else {
    right.style.gridColumn=' 2/span 1';
    this.shortenArrow='keyboard_arrow_left';
   }
  }

  ngAfterViewInit(): void {

    function mediaQueryFor700px(x) {
      document.getElementById("more_shorten_a").click();   
    }
    this.mediaQueryFunc1=mediaQueryFor700px.bind(this);
    this.matchMediaOBject= window.matchMedia("(min-width: 700px)");
    this.matchMediaOBject.addListener(this.mediaQueryFunc1);
    this.mediaQueryFunc1(this.matchMediaOBject);
    
  }

  ngOnDestroy(): void {
    if(this.matchMediaOBject && this.mediaQueryFunc1)
      this.matchMediaOBject.removeListener(this.mediaQueryFunc1);
  }

}

