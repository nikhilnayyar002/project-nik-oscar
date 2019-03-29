
import * as firebase from 'firebase/app';

export class Upload {
    id:string;
    iam:"upload";
    userID:string;
    userName:string;
    date:Date|firebase.firestore.Timestamp; 
    type:'file'|'link';
    data:string;      //file | link url
    title:string;
    fileType:string;
    detail:string;
    isPublic:boolean;
    fileRef:string;
}