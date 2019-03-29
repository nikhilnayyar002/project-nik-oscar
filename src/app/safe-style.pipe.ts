import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeStyle'
})
export class SafeStylePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(url:string, type:string) {
      let str:string=url;
      let t=type.split(':');
      if(t.length>1 && t[0]=='bgY')
        str=`url(${url}) center ${t[1]} / cover no-repeat`;
      return this.sanitizer.bypassSecurityTrustStyle(str);
  }

}

export enum SafeToType{
  BackgroundUrl='backgroundUrl'
}