import * as firebase from 'firebase/app';

export class Message {
    userID:string;
    userName:string;
    date:Date | firebase.firestore.Timestamp;
    type:'blob'|'post'|'upload'|'group'|'message';
    detail:string;
    data:string;
    fileRef:string;
    id:string;     
}
