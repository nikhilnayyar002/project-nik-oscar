import { Component } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { AuthService } from 'src/app/auth.service';
import { User } from 'src/app/model/user';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})

export class PrivacyComponent {

  saving:boolean;
  msg="";
  user:User;

  constructor(public auth:AuthService,private db: AngularFirestore) {
  }
  ngOnInit(): void {
    this.user={ ...this.auth.user };
  }
 
  save() {
  	 this.saving=true;
	   this.msg="Saving changes...";
     this.db.collection("users").doc(`${this.auth.user.id}`).update({
      privacy:this.user.privacy
     })
    .then(()=> {
      this.msg="Save Sucess!";
      this.saving=false;
    })
    .catch((error)=> {
        this.msg=error.message;
        this.saving=false;
    });
  }


} 