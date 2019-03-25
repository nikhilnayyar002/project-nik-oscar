import { Component,Input } from '@angular/core';
import { SignInCheckService} from '../../sign-in-check.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-upload-card',
  templateUrl: './upload-card.component.html',
  styleUrls: ['./upload-card.component.css'],
  styles : [`
        :host {
            width: 70%;
            margin: 10px auto;
            display: block;
        }
    `]

})
export class UploadCardComponent {

  @Input() upload;
  @Input() user;
  tooltipText='Copy to clipboard';

  constructor(public auth:SignInCheckService) { 
    
  }

  getID(id) {
    return 'n'+id;
  }

  download() {
    if(this.upload.data)
    window.open(this.upload.data);
    return false;
  }

 copyToClipboard() {

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
  textArea.value = 'upload:'+ this.upload.id;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy'); //let successful
    this.tooltipText='Copied';
  } catch (err) {
    console.log('Oops, unable to copy');
  }
  document.body.removeChild(textArea);
  return false; 
 }



}
