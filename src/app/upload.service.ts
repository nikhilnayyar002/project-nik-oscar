import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { take, finalize } from 'rxjs/operators';
import { FileType } from './shared/global';
import { Upload } from './model/upload';
import { promise } from 'protractor';
import * as firebase from 'firebase/app';
import { UploadDataComponent } from './upload/upload-data/upload-data.component';

@Injectable({
  providedIn: UploadDataComponent
})
export class UploadService {

  constructor(
    private auth:AuthService,
    private db:AngularFirestore,
    private storage:AngularFireStorage
  ) { }

  msg='';
  percent$:Observable<number>;

  uploadData(
    upload:Upload,dataType:string,data:File|string,
    title:string, fileType:FileType, detail:string, isPublic:boolean
    ):promise.Promise<any>|Observable<promise.Promise<any>>|string {

    this.msg="Uploading...";
    let datet:Date=new Date();
    let id=datet.getTime().toString().slice(-4)+this.auth.user.id.slice(0,4);

    if(dataType=='file') {
     if(data instanceof File) {
        this.msg="Uploading...(file)";       
        let filePath =`upload/${this.auth.user.id}/${id}/${(<File>data).name}`;
        let fileRef=this.storage.ref(filePath);
        const task = this.storage.upload(filePath, data);

        //Uploading...(file:%)
        this.percent$= task.percentageChanges();
        return new Observable((obs)=>{
          try {
            task.snapshotChanges().pipe(finalize(()=>{  
              let g=fileRef.getDownloadURL().subscribe((url)=>{
               g.unsubscribe();
               obs.next(store.bind(this)(url,filePath));
              });
            }),take(1)).subscribe();         
          }
          catch(error){
             console.log(error.message);
          }
         });
      }
      else if(!upload) { 
       return "No file selected to upload.";     //get out of function with error msg
      }
    }
    else if(upload && upload.type=='file') {  //this time link was selec. therefore del prev file
        this.msg="Deleting...(previous upload file)";  
        let fileRef=this.storage.ref(upload.fileRef);

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
    else store.bind(this)('','')	

    function store(url,fileRef)  {
      let proms:Array<promise.Promise<any>>=[];
      this.msg="Uploading...(upload info)";
      proms.push(     
        this.db.collection("uploads").doc(id).set({
          id:id,
          iam:"upload",
          userID:this.auth.user.id,
          userName:this.auth.user.name,
          date:upload?upload.date:datet,
          type:dataType,
          data:url?url:data,  //file url or link
          title:title?title:'no title',
          fileType:fileType,
          detail:detail,
          isPublic:isPublic,
          fileRef:fileRef
        })
        .catch((error)=> {
          console.log("uploads/id:"+error.message);
        })
      );

      if(!upload) {
        this.msg="Uploading...(user info)";         
        proms.push(
          this.db.collection("users").doc(this.auth.user.id).collection("others")
          .doc("uploads").update({
            datas: firebase.firestore.FieldValue.arrayUnion(id+'#$%'+(title?title:'no title'))   
          })
          .catch((error)=> {
            console.log("user/upload/id:"+error.message);
          })
        );  
      } 
      return promise.all(proms);
    } 
  }  

  delete(upload:Upload):promise.Promise<any>|Observable<promise.Promise<any>> {

    this.msg="Deleting...(file)";
    let fileRef=this.storage.ref(upload.fileRef);
    if(upload.type=='file') {

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
    else  del.bind(this)();
 
    function del() {
       this.msg="Deleting...(upload)";

       let t1=this.db.collection("users").doc(this.auth.user.id)
       .collection("others").doc("uploads").update({
          datas: firebase.firestore.FieldValue.arrayRemove(upload.id+'#$%'+upload.title)
       })
       .catch((error)=> {
          console.log("uploads/id:"+error.message);
       });

       let t2=this.db.collection("uploads").doc(upload.id).delete()
       .catch((error)=>{
          console.log("uploads/id:"+error.message);
       });
 
       return promise.all([t1,t2]);

    }
 
  }

}
