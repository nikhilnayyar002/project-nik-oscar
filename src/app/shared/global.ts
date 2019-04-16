export const global = {

    projectID:'dynamo-t',
    headerHeight:50,
    userLink:'/info/users/user',
    groupLink:'/ino/groups/group',
    templateDesignLink:'/template/design/'


}

export enum NotifType {
    Post='Post',
    FriendRequest='FriendRequest',
    FriendRequestSent='FriendRequestSent',
    FriendConfirmed='FriendConfirmed',
    ChatRequest='ChatRequest'
}

export function encodeImageToUrl(file) {
    let fileTypes = FILES[3].ext;
    if(file) {
      let reader = new FileReader();
      let extension = file.name.split('.').pop().toLowerCase(); 
      let isSuccess = fileTypes.indexOf(extension) > -1;
      if (isSuccess) { 
        reader.readAsDataURL(file);
        return reader;
      }
    }
    return null;
}

export interface CommonObjectFeature {
  id:string;
}

/*
@template to use above function 

encodeImage(element) {
  let file=element.target.files[0];
  if(file) {
    let reader=encodeImageToUrl.bind(this)(file);
    if(!reader) {
   
    }
    else 
      reader.onloadend=()=>{

      };
  }
} 

*/


export function copyToClipboard(value:string) { 
  let textArea = document.createElement("textarea");
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  document.body.appendChild(textArea);
  textArea.value = value;
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy'); //let successful=
  } catch (err) {
    console.log('Oops, unable to copy');
  }
  document.body.removeChild(textArea);
  return 'Copied';
 }

 export class FileType{
   id:string;
   ext:Array<string>;
 }
 
 //filetype order should remain same
 export const FILES=[
  {id:'Program Code', ext:['c','cpp','ts','html','css','java','bat']},
  {id:'text', ext:['txt']},
  {id:'document', ext:['docx','doc','pdf']},
  {id:"image", ext:["jpg","png","jpeg","gif"]},
  {id:'any', ext:['']}
 ];

 export function rtnFileType(str:string) {
    for(let i of FILES) {
      if(i.id==str) return i;
    }
    return FILES[0];
 }
 

   /*
  createTemplateFilter(arr) {
    function func(datas:Array<{id:string;}>) {
      let i=0,j=0,rtnArr=[],l=datas.length;
      while(i<l) {
        while(arr[i]!=datas[j].id)
          ++j;
        rtnArr.push(datas[j]);
        ++i;++j;
      }
      return rtnArr;
    } 
    return func;
  }
*/



 