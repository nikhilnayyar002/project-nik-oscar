import * as firebase from 'firebase/app';

export class Post {
    id:string;
    likes:Array<string>; //user IDs
    iam:"post";
    userID:string;
    userName:string;
    date: any;//Date|firebase.firestore.Timestamp;
    isPublic:boolean;
    type:'template'|'link';
    data:string;      //template | link url
    title:string;     
    image:string;
    fileRef:string;
    detail:string;
}
