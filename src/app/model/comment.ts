import * as firebase from 'firebase/app';

export class Comment {
    id:string;      
    detail:string;
    userID:string;
    userName:string;
    date:Date|firebase.firestore.Timestamp; 
}