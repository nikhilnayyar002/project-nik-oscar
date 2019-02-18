import { Component } from '@angular/core';
import { SignInCheckService} from '../sign-in-check.service';
import { PaletService } from '../palet.service';
import { Router }                 from '@angular/router';
import { AngularFirestore} from '@angular/fire/firestore';


@Component({
  selector: 'app-login-palet',
  templateUrl: './login-palet.component.html',
  styleUrls: ['./login-palet.component.css']
})
export class LoginPaletComponent {

  msg="";

  constructor(private db: AngularFirestore, public router:Router, private auth:SignInCheckService, public palet: PaletService){ }

  signIn(email,pass) {
  		this.msg="Signing In...";
  		let obs=this.auth.signIn(email,pass);
  		obs.subscribe( ()=>{
  			this.msg="";
  			this.palet.isOpen=false;
			this.router.navigate([{ outlets: { palet: null  }}]);
  		},(error)=> {
			this.msg=error.message;
  		});
  }

  signUp(email,pass) {
    	this.msg="Signing Up...";
 		  let obs=this.auth.signUp(email, pass);
  		obs.subscribe( (cred)=>{
        let user=cred.user;
        this.db.collection("users").doc(`${user.uid}`).set({
          uid:user.uid,
          email:user.email,
          emailVerified:user.emailVerified,
          name:"no name",
          image:"",
          extra: {
            posts_no:0,
            followers_no:0,
            comments_no:0,
            likes_no:0
            },
          about:"",
          phone:"",
          groups:[],
          followers:[],
          posts:[],
          uploads:[],
          shares:[],
          friends:[],
          privacy: {
            show_email:true,
            show_about:true,
            show_phone:true,
            show_image:true,
            show_group:true
          }
        })
        .then(()=> {
          this.msg="";
          this.palet.isOpen=false;
          this.router.navigate([{ outlets: { primary:'dashboard/general',palet: null  }}]);
        })
        .catch((error)=> {
          this.msg=error.message;
        });
  		},(error)=> {
          this.msg=error.message;
      });
  }
}
