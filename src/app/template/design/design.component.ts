import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute}   from '@angular/router';
import { SignInCheckService} from '../../sign-in-check.service';
import { AngularFirestore} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';
import { finalize,take} from 'rxjs/operators';
import { Router }  from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
export class DesignComponent {

  constructor(
    private route: ActivatedRoute,
    private auth:SignInCheckService,
    private db:AngularFirestore,
    private storage:AngularFireStorage
  ) {}

  //real data
  elemArr=[];

  count=0;
  id=0;

  @Input() title='';
  @Input() type; 
  @Input() typeID='';
  create='?';
  doing=false;
  msg='';
  acess='private';
  typeData=null;
  generated=false;
  options=null;
  template=null;

  ngOnInit() {
    let t=this.route.snapshot.paramMap.get('id').split('-');
    this.type=t[0];

    let g=this.db.collection('templates', 
        ref=>ref.where('id','==', this.type))
        .valueChanges().subscribe((data:any)=>{

      g.unsubscribe();
      if(data.length) {

       if(t.length>1) {
         this.typeID=t[1];
         this.create='save';
         this.generated=true;
         let k=this.db.collection("created_templates").doc(t[1])
         .valueChanges().subscribe((template)=> {
           k.unsubscribe();
           this.typeData=data[0];
           this.options=data[0].options;           
           if(template) {
             this.template=template;
             this.render(this.template);         
           }
           else console.log('error retrieving template');
         });
       }
       else {
        this.create='create';
        this.typeID=(new Date()).getTime().toString().slice(-3)
                    +this.auth.user.uid.slice(0,4);
        this.typeData=data[0];
        this.options=data[0].options;    
       }

      }
      else {
        console.log("error with temp. type");
      }
    }); 

  }

  render(data) {
    let page = document.querySelector('#page');
    let saveArr=data.datas;
    for(let i=0;i<saveArr.length;++i) {  
      let element=this.createElem(
        saveArr[i].type,
        saveArr[i].data,
        saveArr[i].time
      );  
    }

  }

  createElem(type,value='',time='') {

    let right = document.querySelector('#page');
    if(!right) {
        right = document.querySelector('#right');
        let temp=document.createElement('div');
        temp.className=this.typeData.css;
        temp.id='page';
        right.appendChild(temp);
        right=temp;
    }

    let left = document.querySelector('#left');   
    let element,element2,id=('n'+(this.id++));

    let div=document.createElement('div');
	  div.className='all-time-div';

    let badger=document.createElement('div');
	  badger.className='all-time-badge-container';
    let span5=document.createElement('span');
	  span5.textContent=type;
	  span5.className='type';
    badger.appendChild(span5);
    let span3=document.createElement('span');
	  span3.innerHTML='&uarr;';
	  span3.id=id+':up';
	  span3.onclick=this.moveUp.bind(this);
    badger.appendChild(span3); 
    let span4=document.createElement('span');
	  span4.innerHTML='&darr;';
	  span4.id=id+':down';
	  span4.onclick=this.moveDown.bind(this);
    badger.appendChild(span4);
    let span1=document.createElement('span');
	  span1.textContent='Save';
	  span1.id=id+':save';
	  span1.onclick=this.save.bind(this);
	  badger.appendChild(span1);
    let span2=document.createElement('span');
	  span2.textContent='Del';
	  span2.id=id+':del';
	  span2.onclick=this.remove.bind(this);
    badger.appendChild(span2);
    div.appendChild(badger);

    let taTypes=['box','point','pre'];

    if(type=='img'||type=='cover-img') {
      element2=document.createElement('input');
 		 	element2.type="file";
 		  element2.style.display='none';
      let t=document.createElement('label');
      t.htmlFor=id;
      t.textContent='Upload';
      div.appendChild(t);   
    }
    else if(taTypes.includes(type))
    	element2=document.createElement('textarea');
    else
      element2=document.createElement('input');

    element2.id=id;
    div.appendChild(element2);
    left.appendChild(div);

    if(type=='img'||type=='cover-img'||type=='link-img') {
      element=document.createElement('img');
      element.className=type;
      if(type=='link-img') element.className='img';
      if(value) element.src=value;
    }

    else{
     if(type=='box'||type=='point') {
      element=document.createElement('div');
      element.className=type;
     }
     else element=document.createElement(type);
     element.textContent=value?value:'[Empty]';
     element2.value=value?value:'[Empty]';
    }

    right.appendChild(element);
    this.elemArr.push({
      id:id,type:type,
      element:element,
      element2:element2,
      file:null,
      time:time?time:(new Date()).getTime().toString()
    });
    return element;

     //li = document.createElement('li');
     //li.className='clearfix';    
     //div1.classList.add("message-data", "align-right");
     //div2.style.whiteSpace='pre-line';     
     //span1.textContent=this.msgDate(msg,false)+' ';
     //ul.appendChild(li);
  }

  remove(event) {
	 let n = event.target.parentElement.parentElement;
	 let id=event.target.id.split(":")[0];
	 clearInner(n);
	 let t=this.elemArr;
	 for(let i=0;i<t.length;++i) {
		if(t[i].id==id) {
		  let node=t[i].element;
		  node.parentNode.removeChild(node);
      this.elemArr = this.elemArr.filter(data => data.id!=id );
		  if(node.type=='img'||node.type=='cover-img')
        this.deleteImages([node]);
      break;
		}
	 }	
	 function clearInner(node) {
  		while (node.hasChildNodes()) {
    	clear(node.firstChild);
  		}
  		node.parentNode.removeChild(node);
	 }
	 function clear(node) {
 		while (node.hasChildNodes()) {
    	clear(node.firstChild);
  		}
  		node.parentNode.removeChild(node);
	 }
  }

  save(event) {
  	let id=event.target.id.split(":")[0];
  	let data, t=this.elemArr;
	  for(let i=0;i<t.length;++i) {
		  if(t[i].id==id) {
		    data=t[i];
		    break;
		  }
	  }

	  if(data.type=='img'||data.type=='cover-img') {
    	let fileTypes = ['jpg','jpeg','png','gif','svg','ico','bmp'];
    	let file=data.element2.files[0];
    	if(file) {  
    	    let reader = new FileReader();   
      		let extension = file.name.split('.').pop().toLowerCase(); 
      		let isSuccess = fileTypes.indexOf(extension) > -1;
      		if (isSuccess) {
              data.file=file; 
          		reader.onloadend = ()=>{
                	data.element.src=<string>reader.result;
          		};
          		reader.readAsDataURL(file);
      		}
   		} 
	  }
    else if(data.type=='link-img') {
      data.element.src=data.element2.value;
    }
	  else data.element.textContent=data.element2.value;
  }

  moveUp(event) {
  	let element = event.target.parentElement.parentElement;
   	let id=event.target.id.split(":")[0]; 	
  	if(element.previousElementSibling)
    	element.parentNode.insertBefore(element, element.previousElementSibling);
  	let t=this.elemArr;
	  for(let i=0;i<t.length;++i) {
		 if(t[i].id==id) {
		  element=t[i].element;
  		if(element.previousElementSibling){
          element.parentNode.insertBefore(element, element.previousElementSibling);
		      let temp=t[i]; t[i]=t[i-1]; t[i-1]=temp;
      }

      break;
		 }
	  }	
  }

  moveDown(event) {
  	let element = event.target.parentElement.parentElement;
  	let id=event.target.id.split(":")[0]; 
    if(element.nextElementSibling)
    	element.parentNode.insertBefore(element.nextElementSibling, element);
  	let t=this.elemArr;
	  for(let i=0;i<t.length;++i) {
		 if(t[i].id==id) {
		  element=t[i].element;
      if(element.nextElementSibling) {
    	   element.parentNode.insertBefore(element.nextElementSibling, element);
         let temp=t[i]; t[i]=t[i+1]; t[i+1]=temp;
      }
		  break;
		 }
	  }  
  }

  do() {
    if(this.doing) return
    let obsList=[];
    let imgPercent=0;
    
    if(this.elemArr.length) {
      this.doing=true;
      for(let i=0;i<this.elemArr.length;++i) {
        let data=this.elemArr[i];
        if(data.type=='img'||data.type=='cover-img') {
          if(data.file) {
           let obs=new Observable((obs)=>{
            let filePath =`templates/${this.typeID}/${data.time}`; 
            let fileRef=this.storage.ref(filePath);  
            const task = this.storage.upload(filePath, data.file);
            task.snapshotChanges().pipe(finalize(()=>{
              let g=fileRef.getDownloadURL().subscribe((url)=>{
               imgPercent+=100/obsList.length;
               this.msg='Doing Job..(Images: '+imgPercent+'%)';
               g.unsubscribe();
               
               obs.next(url);             
               obs.complete();
              });
            })).subscribe();
      
            return {unsubscribe() {}};
           });
           obsList.push(obs);
          }
          else {
           let obs=of('');
           obsList.push(obs);
          }
        }
      }

      if(obsList.length) {  
        let t=forkJoin(obsList).pipe(take(1)).subscribe((urls:[])=>{
          this.saveFurther(urls);
        });
      }
      else this.saveFurther(null); 
    }
  }

  saveFurther(urls) {

        this.msg="Doing Job..(creating template)"; 
        let saveArr=[];
        let count=0;

        for(let i=0;i<this.elemArr.length;++i) {
          let data=this.elemArr[i];
          let value;
          if(data.type=='img'||data.type=='cover-img') {
            let h=urls[count++];
            if(h) value=h; else value=data.element.src;
          }
          else if(data.type=='link-img') value=data.element.src;
          else value=data.element.textContent;
          saveArr.push({type:data.type,data:value,time:data.time});
        }

        this.db.collection("created_templates").doc(this.typeID).set({
          id:this.typeID,
          datas:saveArr,
          type:this.typeData.id,
          name:this.auth.user.name,
          uid:this.auth.user.uid,
          title:this.title,
          acess:this.acess,
          css:this.typeData.css     
        }).then(()=> {
          this.msg="Doing Job..(save user info)";
          this.db.collection("users").doc(this.auth.user.uid).collection("others").doc("templates").update({
            datas: firebase.firestore.FieldValue.arrayUnion(this.typeID),
          })
          .then(()=> {
            this.doing=false;
            this.generated=true;
          }).catch((error)=> {
            console.log("inner error:"+error.message);
            this.doing=false;
          });
        })
        .catch((error)=> {
          console.log("outer error:"+error.message);
          this.doing=false;
        });

  }

  deleteImages(datas) {
   let error='';
   this.msg="Deleting...(images)";
   let subsArr$=[];

   for(let i=0;i<datas.length;++i) {
     let data=datas[i];
     if(data.type=='img'||data.type=='cover-img') {
      if(data.data || (data.element && data.element.src)){
        let filePath =`templates/${this.typeID}/${data.time}`;
        let fileRef=this.storage.ref(filePath);
        subsArr$.push(fileRef.delete());
      }
     } 
   }

   if(subsArr$.length) {
    return forkJoin(subsArr$);
   }
   else return null;
  }

  delete() {
    this.doing=true;
    let t=this.deleteImages(this.template.datas);
    if(t) {
     let g=t.subscribe(()=>{
          g.unsubscribe();
          deleteFurther.bind(this)();
     },
     (error)=>{
        console.log('error occured');
        console.log(error);
        this.doing=false;        
     });    
    }
    else deleteFurther.bind(this)();

    function deleteFurther() {

          this.msg="Deleting...(template)";

          this.db.collection("created_templates").doc(this.typeID).delete()
          .then(()=> {
              this.msg="Deleting...(user info)";
              this.db.collection("users").doc(this.auth.user.uid)
               .collection("others").doc("templates").update({
                datas: firebase.firestore.FieldValue.arrayRemove(this.typeID)
              })
              .then(()=> {
                this.doing=false;
              }).catch((error)=> {
                console.log("inner error:"+error.message);
                this.doing=false;
              });
          })
          .catch((error)=> {
            console.log("outer error:"+error.message);
            this.doing=false;
          });

    }

  }



}
