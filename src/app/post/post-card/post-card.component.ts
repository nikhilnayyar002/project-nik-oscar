import { Component,Input } from '@angular/core';
import { HostListener } from '@angular/core';
import { SignInCheckService} from '../../sign-in-check.service';
import { PostParentChildService} from '../../post-parent-child.service';
import { FormControl } from '@angular/forms';
import { Router}   from '@angular/router';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css'],
  styles : [`
        :host {
            width: 70%;
            margin: 10px auto;
            display: block;
        }
    `]
})

export class PostCardComponent {


  @Input() post;
  @Input() user;
  @Input() comments$;
  @Input() link=false;
  detail=new FormControl('');
  subs;
  comments;
  tooltipText='Copy to clipboard';

  constructor(
    public auth:SignInCheckService,
    private ser:PostParentChildService,
    private router:Router
    ) { }

  getID(id) {
    return 'n'+id;
  }
 
  @HostListener('click') onClick() {
    if(this.post && this.post.data) {
      if(this.post.data_type=='link')
        window.open(this.post.data)
      else 
        this.router.navigate([this.post.templateUri]);
    }
  };

  liked=false;commentsClicked=false;

  like() {
    if(!this.liked) {
    this.ser.messageParent({like:true,post:this.post,value:"like"});
    this.liked=true;
    }
    else {
    this.ser.messageParent({like:false,post:this.post,value:"like"});
    this.liked=false;
    }
   return false; 
  }


  comment() {
    if(this.detail.value) {
      this.ser.messageParent({comment:this.detail.value,post:this.post,value:"comment"});
    }
   return false; 
  }

  commentsTrigger(event) {
    if(this.commentsClicked)
        this.commentsClicked=false;
    else
        this.commentsClicked=true;
    if(!this.subs)
      this.subs=this.comments$.subscribe(({next:(data)=>{this.comments=data}}));

    return false; 
  }     

  trackById(index: number, comment): string { return comment.id; }

  /*ngOnViewInit() {
  	setTimeout(()=>{},0);
  }
  */

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
  textArea.value = 'post:'+ this.post.id;
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


  ngOnDestroy() {
   if(this.subs) this.subs.unsubscribe();
  }
  

}
