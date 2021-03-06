import { Component,Input } from '@angular/core';
import { copyToClipboard } from 'src/app/shared/global';
import { Upload } from 'src/app/model/upload';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-upload-card',
  templateUrl: './upload-card.component.html',
  styleUrls: ['./upload-card.component.scss'],
  styles : [`
        :host {
            width: 100%;
            margin: 10px auto;
            display: block;
        }
    `]

})
export class UploadCardComponent {

  @Input() upload:Upload;
  tooltipText:'Copy to clipboard'|'copied!'='Copy to clipboard';

  constructor(public auth:AuthService) { 
  }

  getID(id:string) { return 'n'+id;}

  download() {
    if(this.upload.data)
      window.open(this.upload.data);
    return false;
  }

  copyToClipboard() {
    copyToClipboard('upload:'+ this.upload.id);
    return false
  }

}
