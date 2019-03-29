import { Component} from '@angular/core';
import { ActivatedRoute}   from '@angular/router';
import { AngularFirestore, Query} from '@angular/fire/firestore';
import { take} from 'rxjs/operators';
import { Template } from '@angular/compiler/src/render3/r3_ast';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent {


  error='';

  constructor(
    private route: ActivatedRoute,
    private db:AngularFirestore
  ) {}

  ngOnInit() {
    
    let raw=this.route.snapshot.paramMap.get('id');
    if(raw.length>9) {  //-(4)(4)
    	let id=raw.slice(-8);
    	let title=raw.replace('-'+id,'').replace(/-/gi, ' ');
      let query=(ref:Query) => { 
    		return ref.where("title", "==", title )
    					.where("id", "==", id );
      	};

      this.db.collection("templates", query)
      	.valueChanges().pipe(take(1)).subscribe((data:Array<Template>)=>{
      	if(data.length) {
      	 	 this.render(data[0]);
      	}
      	else {
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

}
