import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appChat]'
})
export class ChatDirective {

   constructor(public viewContainerRef: ViewContainerRef) { }

}