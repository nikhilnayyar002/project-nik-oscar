import {User} from './user';
import * as firebase from 'firebase/app';

export class Discussion {
    users:Array<string>;    //users ID
    title:string;
    groupID:string;
    id:string;
    status:'open'|'closed';
    date:Date | firebase.firestore.Timestamp;
}
