import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute}   from '@angular/router';
//import { SignInCheckService} from '../../sign-in-check.service';
import { AngularFirestore, Query} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';
import { finalize} from 'rxjs/operators';
import { Router }  from '@angular/router';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent {


  loading=true;
  error='';

  constructor(
    private route: ActivatedRoute,
    private db:AngularFirestore
  ) {}

  ngOnInit() {
    
    let raw=this.route.snapshot.paramMap.get('id');
    if(raw.length>4) {
    	let id=raw.slice(-7);
    	let title=raw.replace('-'+id,'').replace(/-/gi, ' ');
      let query=(ref:Query) => { 
    		return ref.where("title", "==", title )
    					.where("id", "==", id );
      	};

      let t=this.db.collection("created_templates", query)
      	.valueChanges().subscribe((data:Array<{}>)=>{
      	if(data.length) {
      		 t.unsubscribe();
      	 	 this.render(data[0]);
      	}
      	else {
      		t.unsubscribe();
      		this.error="Error: Url not matched. Try reloading..";       	
      	}
      });

    }
    else {
    	this.error="Invalid page name..(short length error)";
    }

  }

  render(data) {
    let page = document.querySelector('#page');
    let temp=document.createElement('div');
    temp.className=data.css;
    page.appendChild(temp);
    page=temp;

    let saveArr=data.datas;
    for(let i=0;i<saveArr.length;++i) {
    	let element;
    	let type=saveArr[i].type;
    	let value=saveArr[i].data;      
  		if(type=='img'||type=='cover-img'||type=='link-img') {
  		    element=document.createElement('img');
      		element.className=type;
          if(type=='link-img') element.className='img';
      		element.src=value;
  		}
    	else if(type=='box'||type=='point') {
      		element=document.createElement('div');
      		element.className=type;
      		element.textContent=value;
    	}
    	else {
    		element=document.createElement(type);
    		element.textContent=value;
    	}
    	page.appendChild(element);   	
  	}

  }

     /*
          id:,
          datas:saveArr,
          type:this.type,
          name:this.auth.user.name,
          uid:this.auth.user.uid,
          title:this.title,
          css:
    */


}
