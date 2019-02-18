import { Component, OnInit } from '@angular/core';
import { SignInCheckService} from './sign-in-check.service';
import { PaletService } from './palet.service';
import { Router }   from '@angular/router';
import { AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'project-nik-oscar';
  status=false;
  user;
  signInLabel="SignIn\Up";
  sidebar;body;
  lastPalet="";
  constructor(private db: AngularFirestore,public router:Router, private auth:SignInCheckService, public palet: PaletService){ }
  ngOnInit() {
    this.auth.status.subscribe({
   			 next:(user:{uid:string})=>{
      		this.status=user?true:false;
          if(user)
            this.db.doc(`users/${user.uid}`).valueChanges().subscribe((data)=>{
                    this.user=data;
            });
          else this.user=null;
    			if(this.status) this.signInLabel="SignOut";
          else this.signInLabel="SignIn\Up";
    		 }
   		 });
  }
  ngAfterViewInit() {
   this.sidebar=document.querySelector("#sidebar");
   this.body=document.querySelector("#body");
  }

  loginPalet() {
   if(!this.palet.isOpen || this.lastPalet!="login") {
      this.lastPalet="login";
      if(this.signInLabel=="SignIn\Up") {
        this.palet.isOpen=true;
        this.router.navigate([{ outlets: { palet: "login-palet"  }}]);
      }
      else {this.palet.isOpen=false; this.signOut();}
   }
   else {
    this.palet.isOpen=false;
    this.router.navigate([{ outlets: { palet: null  }}]);
   } 
  }

  postPalet() {
   if(this.palet.isOpen && this.lastPalet=="post") {
      this.palet.isOpen=false;
      this.router.navigate([{ outlets: { palet: null  }}]);
   }
   else {
      if(!this.status) {this.palet.isOpen=false;return;}
      this.lastPalet="post";
      this.palet.isOpen=true;
      this.router.navigate([{ outlets: { palet: "post-palet"  }}]);
   }
  }

  sideBar() {
   if(this.sidebar.style.display=="block")
      this.sidebar.style.display="none";
   else this.sidebar.style.display="block";
  }

  bodyClk() {
   if(this.sidebar.style.display=="block")
     this.sidebar.style.display="none";
   this.palet.isOpen=false;
   this.router.navigate([{ outlets: { palet: null  }}]);
  }
 
  signOut() {
 		  let obs=this.auth.signOut();
  		obs.subscribe( ()=>{
        this.router.navigate([{ outlets: { primary:'home',palet: null }}]);
      },
  		(error)=> {
        console.log(error.code);console.log(error.message);
  		});
  }

}


