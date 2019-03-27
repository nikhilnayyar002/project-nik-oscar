import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeStyle'
})
export class SafeStylePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(url:string, type:string) {
      let str:string=url;
      if(type==SafeToType.BackgroundUrl)
        str=`url(${url}) no-repeat center`;
      return this.sanitizer.bypassSecurityTrustStyle(str);
  }

}

export enum SafeToType{
  BackgroundUrl='backgroundUrl'
}