import { Component} from '@angular/core';
import { ActivatedRoute}   from '@angular/router';
import { AngularFirestore, Query} from '@angular/fire/firestore';
import { take} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from 'src/app/model/user';
import { PoolService } from 'src/app/pool.service';
import { Template } from 'src/app/model/template';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent {


	error='';
	user$:Observable<User>;
	template:Template;

  constructor(
    private route: ActivatedRoute,
		private db:AngularFirestore,
		private ps:PoolService
  ) {}

  ngOnInit() {
    
		let raw=this.route.snapshot.paramMap.get('id');
		let arr=raw.split('-_-_-_-');
		if(arr.length && arr.length>1 && arr[0] && arr[1]) {
			let title=arr[0];
			let id=arr[1];

      let query=(ref:Query) => { 
    		return ref.where("title", "==", title )
    					.where("id", "==", id );
      	};

      this.db.collection("templates", query)
      	.valueChanges().pipe(take(1)).subscribe((data:Array<Template>)=>{
      	if(data.length) {

						this.render(data[0]);
						this.template=data[0];
						this.user$=this.ps.getUserDoc(data[0].userID);
      	}
      	else {
      		this.error="Error: Url not matched. Try reloading..";       	
      	}
			});
			
		}
    else {
    	this.error="Invalid page url..(Don't play fool)";
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
