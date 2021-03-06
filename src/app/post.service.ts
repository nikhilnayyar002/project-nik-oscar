import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { Post } from './model/post';
import { global } from './shared/global';
import * as firebase from 'firebase/app';
import { Comment } from './model/comment';
import { PostModule } from './post/post.module';

@Injectable()
export class PostService {

  constructor(
    private auth:AuthService,
    private db:AngularFirestore,
    private storage:AngularFireStorage
    ) { }

  msg='';
  percent$:Observable<number>;
  
  postData(
      post:Post, file:File, image:string, isPublic:boolean, type:string,
      link:string, title:string, detail:string
      ):Observable<Promise<any>> {
  
      this.msg="posting...";
      let datet:Date=new Date();
      let id=post?post.id:(datet.getTime().toString()+this.auth.user.id.slice(0,4));
  

      if(file) {
          this.msg="posting...(file)";       
          let filePath =`post/${this.auth.user.id}/${id}/${file.name}`;
          let fileRef=this.storage.ref(filePath);
          let task = this.storage.upload(filePath, file);

          this.percent$= task.percentageChanges();
          return new Observable((obs)=>{
            try {
              task.snapshotChanges().pipe(finalize(()=>{
                let g=fileRef.getDownloadURL().subscribe((url)=>{
                 g.unsubscribe();
                 obs.next(store.bind(this)(url,filePath));
                });
              })).subscribe();         
            }
            catch(error){
               console.log(error.message);
            }
           });
      }
      else if(post && !image.includes(global.projectID+'.appspot.com')
        && post.image.includes(global.projectID+'.appspot.com')
      ) {
          this.msg="Deleting...(previous post file)";  
          let fileRef=this.storage.ref(post.fileRef);
  
          return new Observable((obs)=>{
            try { 
              fileRef.delete().pipe(take(1)).subscribe(()=>{
                obs.next(store.bind(this)('',''));
              }); 
            }
            catch(error){
               console.log(error.message);
            }
           });       
      }
      else return new Observable((obs)=>{
        obs.next(store.bind(this)('',''));
      }); 
      
      function store(url,fileRef)  {
        let proms:Array<Promise<any>>=[];
        this.msg="posting...(post info)";
        proms.push(     
          this.db.collection("posts").doc(id).set({
            id:id,
            likes:[],
            iam:"post",
            userID:this.auth.user.id,
            userName:this.auth.user.name,
            date:post?post.date:datet,
            isPublic:isPublic,
            type:type,
            data:link,    //template | link url
            title:title?title:'no title',  
            image:url?url:image,
            fileRef:fileRef,
            detail:detail
          })
          .catch((error)=> {
            console.log("posts/id:"+error.message);
          })
        );

        if(!post) {
          this.msg="posting...(user info)";         
          proms.push(
            this.db.collection("users").doc(this.auth.user.id).collection("others")
            .doc("posts").update({
              datas: firebase.firestore.FieldValue.arrayUnion(id)   
            })
            .catch((error)=> {
              console.log("user/post/id:"+error.message);
            })
          );  
        }
        return Promise.all(proms);
      } 
  }  

  delete(post:Post):Observable<Promise<any>> {

      this.msg="Deleting...(file)";
      let fileRef=this.storage.ref(post.fileRef);
      if(post.fileRef) {
        return new Observable((obs)=>{
          try { 
            fileRef.delete().pipe(take(1)).subscribe(()=>{
              obs.next(del.bind(this)());
            }); 
          }
          catch(error){
             console.log(error.message);
          }
        });
      }  
      else return new Observable((obs)=>{
        obs.next(del.bind(this)());
      });
      
      function del() {
         this.msg="Deleting...(post)";
  
         let t1=this.db.collection("users").doc(this.auth.user.id)
         .collection("others").doc("posts").update({
            datas: firebase.firestore.FieldValue.arrayRemove(post.id)
         })
         .catch((error)=> {
            console.log("posts/id:"+error.message);
         });
  
         let t2=this.db.collection("posts").doc(post.id).delete()
         .catch((error)=>{
            console.log("posts/id:"+error.message);
         });

         return Promise.all([t1,t2]);
      }
  }
  
  likePost(like:boolean,post:Post) {

    if(!like)
      this.db.collection("posts").doc(post.id).update({
        likes: firebase.firestore.FieldValue.arrayRemove(post.id)
      });
    else 
      this.db.collection("posts").doc(post.id).update({
        likes: firebase.firestore.FieldValue.arrayUnion(post.id)
      });
     
  }
  
  commentPost(detail:string,post:Post) {
    let datet=new Date();
    let id=datet.getTime().toString()+this.auth.user.id.slice(0,4);
    this.db.collection("posts").doc(post.id).collection("comments").doc<Comment>(id).set({
      id:id,
      detail:detail,
      userID:post.userID,
      userName:post.userName,
      date:datet,
    });
  }

}
