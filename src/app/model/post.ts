import * as firebase from 'firebase/app';

export class Post {
    id:string;
    likes:Array<string>; //user IDs
    iam:"post",
    userID:string;
    userName:string;
    date: Date|firebase.firestore.Timestamp;
    public:boolean;
    type:'template'|'link';
    data:string;      //template | link url
    title:string;     
    image:string;
    fileRef:string;
    detail:string;
}
