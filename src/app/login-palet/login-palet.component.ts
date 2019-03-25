import { Component } from '@angular/core';
import { SignInCheckService} from '../sign-in-check.service';
import { Router }                 from '@angular/router';
import { AngularFirestore} from '@angular/fire/firestore';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

@Component({
  selector: 'app-login-palet',
  templateUrl: './login-palet.component.html',
  styleUrls: ['./login-palet.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

export class LoginPaletComponent {

  msg="";

  constructor(private db: AngularFirestore, public router:Router, public auth:SignInCheckService){ }

  ngOnInit() {

    if(this.auth.status) {
       this.signOut();
    }
    else if(this.auth.status==undefined) {
       this.router.navigate([{ outlets: {palet: null }}]);
    }

  }

  signIn(email,pass) {
  		this.msg="Signing In...";
  		let obs=this.auth.signIn(email,pass);
  		obs.pipe(takeWhileAlive(this)).subscribe( ()=>{
  		this.msg="";
			this.router.navigate([{ outlets: { palet: null  }}]);
  		},(error)=> {
			this.msg=error.message;
  		});
  }

  signUp(email,pass) {
    	this.msg="Signing Up...";
 		  let obs=this.auth.signUp(email, pass);
  		obs.pipe(takeWhileAlive(this)).subscribe( (cred)=>{
        let user=cred.user;
        let p1=this.db.collection("users").doc(user.uid).set({
          uid:user.uid,
          email:user.email,
          emailVerified:user.emailVerified,
          name:"no name",
          image:"",
          about:"",
          phone:"",
          bgImage:'',
          privacy: {
            show_email:true,
            show_about:true,
            show_phone:true,
            show_image:true,
            show_bgImage:true,
            show_friends:true,            
          },
          bgY:'0px',
          status:'online'
        });
        let p2=this.db.collection("users").doc(user.uid).collection("others").doc("posts").set({
          datas:[],names:[]
        });
        let p5=this.db.collection("users").doc(user.uid).collection("others").doc("uploads").set({
          datas:[],names:[]
        });
        let p6=this.db.collection("users").doc(user.uid).collection("others").doc("shares").set({
          datas:[],names:[]
        });
        let p7=this.db.collection("users").doc(user.uid).collection("others").doc("friends").set({
          datas:[]
        });
        let p8=this.db.collection("users").doc(user.uid).collection("others").doc("make_friends").set({
          friends_req:[],
          friends_conf:[],
          friends_req_rec:[], 
          chats_req_rec:[]                   
        });
        let p9=this.db.collection("users").doc(user.uid).collection("others").doc("chats").set({
          datas:[]
        });
        let p10=this.db.collection("users").doc(user.uid).collection("others").doc("templates").set({
          datas:[]
        });
        Promise.all([p1,p2,p5,p6,p7,p8,p9,p10])
        .then(()=> {
          this.msg="";
          this.router.navigate([{ outlets: { primary:'dashboard/general',palet: null  }}]);
        })
        .catch((error)=> {
          this.msg=error.message;
        });
  		},(error)=> {
          this.msg=error.message;
      });
  }

  signOut() {
      this.db.collection("users").doc(this.auth.user.uid).update({
               status:'offline'
      }).then(()=>{

        let subs=this.auth.signOut().subscribe( ()=>{
          subs.unsubscribe();
          this.router.navigate([{ outlets: { primary:'home',palet: null }}]);
        },
        (error)=> {
          console.log(error.code);console.log(error.message);
        });

      });
  }

}
