
import { Component } from '@angular/core';
import { Router }                 from '@angular/router';
import { AngularFirestore} from '@angular/fire/firestore';
import { AuthService } from 'src/app/auth.service';
import { take } from 'rxjs/operators';
import { User } from 'src/app/model/user';

@Component({
  selector: 'app-popup-login',
  templateUrl: './popup-login.component.html',
  styleUrls: ['./popup-login.component.scss']
})
export class PopupLoginComponent  {

  msg="";
  constructor(private db: AngularFirestore, public router:Router, public auth:AuthService){ }

  ngOnInit(): void {
    if(this.auth.status)   this.signOut();
    else if(!this.auth.init) {
      this.router.navigate([{ outlets: {popup: null }}]);
    }
       
  }

  signIn(email,pass) {
  		this.msg="Signing In...";
  		let obs=this.auth.signIn(email,pass);
  		obs.pipe(take(1)).subscribe( ()=>{
  		  this.msg="";
			  this.router.navigate([{ outlets: { popup: null  }}]);
  		},(error)=> {
			  this.msg=error.message;
  		});
  }

  signUp(email,pass) {
    	this.msg="Signing Up...";
 		  let obs=this.auth.signUp(email, pass);
  		obs.pipe(take(1)).subscribe( (cred)=>{
        let user=cred.user;
        let p1=this.db.collection("users").doc<User>(user.uid).set({
          id:user.uid,
          email:user.email,
          emailVerified:user.emailVerified,
          name:"no name",
          image:"",
          detail:"",
          phone:'+91-0000000000',
          bgImage:'',
          privacy: {
            showEmail:true,
            showAbout:true,
            showPhone:true,
            showImage:true,
            showBgImage:true,
            showFriends:true,            
          },
          bgY:'center',
          status:'online'
        });
        let p2=this.db.collection("users").doc(user.uid).collection("others").doc("posts").set({
          datas:[]
        });
        let p5=this.db.collection("users").doc(user.uid).collection("others").doc("uploads").set({
          datas:[]
        });
        let p7=this.db.collection("users").doc(user.uid).collection("others").doc("friends").set({
          datas:[]
        });
        let p8=this.db.collection("users").doc(user.uid).collection("others").doc("make").set({
          datas:[]      
        });
        let p9=this.db.collection("users").doc(user.uid).collection("others").doc("chats").set({
          datas:[]
        });
        let p10=this.db.collection("users").doc(user.uid).collection("others").doc("templates").set({
          datas:[]
        });
        Promise.all([p1,p2,p5,p7,p8,p9,p10])
        .then(()=> {
          this.msg="";
          this.router.navigate([{ outlets: { primary:'dashboard/general',popup: null  }}]);
        })
        .catch((error)=> {
          this.msg=error.message;
        });
  		},(error)=> {
          this.msg=error.message;
      });
  }

  signOut() {
      this.db.collection("users").doc(this.auth.user.id).update({
          status:'offline'
      }).then(()=>{
        this.auth.signOut().pipe(take(1)).subscribe( ()=>{
          this.router.navigate([{ outlets: { primary:'home',popup: null }}]);
        },
        (error)=> {
          console.log(error.code);console.log(error.message);
        });
      });
  }
}
