export const global = {

    projectID:'dynamo-t',
    userLink:'/info/users/user',
    groupLink:'/ino/groups/group'

}

export enum NotifType {
    Post='Post',
    FriendRequest='FriendRequest',
    FriendReceived='FriendReceived',
    FriendConfirmed='FriendConfirmed',
    ChatRequest='ChatRequest'
}

export function encodeImageToUrl(file) {
    let fileTypes = ['jpg','jpeg','png','gif'];
    if(file) {
      let reader = new FileReader();
      let extension = file.name.split('.').pop().toLowerCase(); 
      let isSuccess = fileTypes.indexOf(extension) > -1;
      if (isSuccess) { 
        return  reader.readAsDataURL(file);
      }
    }
    return null;
}

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