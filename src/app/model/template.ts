import * as firebase from 'firebase/app';

export class Template {
    id:string;
    datas:Array<TemplateItemFormatted>;
    type:string;        //type of template eg:custom
    userName:string;
    uid:string;
    title:string;
    allowChanges:boolean;
    css:string;  
    date:Date|firebase.firestore.Timestamp; //last updated
}

export class TemplateItem {
    id:string;
    element:HTMLElement;    
    element2:HTMLElement;  //generally HTMLInputElement
    file:File;
    time:string;
}
export class TemplateItemFormatted {
    type:String; //img,pre,cover-img,link-img etc
    data:string;
    /*time helps diff. images or files uploaded even when they are same*/
    time:string; 
}

