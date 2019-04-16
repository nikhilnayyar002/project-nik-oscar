import * as firebase from 'firebase/app';

export class Group {

    users:Array<{id:string;status:string;}>;   
    title:string;
    id:string;
    bgY:string='center';
    image:string;
    fileRef:string;
    discussions:Array<string>;    // IDs 
    date:Date | firebase.firestore.Timestamp;
}
