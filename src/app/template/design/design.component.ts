import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router}   from '@angular/router';
import { AngularFirestore} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';
import { finalize,take} from 'rxjs/operators';
import { Observable, forkJoin, of } from 'rxjs';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { TemplateItem, Template } from 'src/app/model/template';
import { encodeImageToUrl } from 'src/app/shared/global';
import { AuthService } from 'src/app/auth.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
export class DesignComponent {

  constructor(
    private route: ActivatedRoute,
    private auth:AuthService,
    private db:AngularFirestore,
    private storage:AngularFireStorage,
    private router:Router
  ) {

  }

  mediaQueryFunc1;
  matchMediaOBject:MediaQueryList;

  ngAfterViewInit(): void {

    function mediaQueryFor830px(x:MediaQueryList) {
      let t:HTMLElement=document.querySelector('app-design');
      let right:HTMLElement=document.querySelector('app-design .right');
      if(right.style.gridColumn=='1 / span 2') return;

      if(x.matches) {
        t.style.width='786px';
      }
      else {
        t.style.width='auto';       
      }
    }
    this.mediaQueryFunc1=mediaQueryFor830px.bind(this);
    this.matchMediaOBject= window.matchMedia("(max-width: 830px)");
    this.matchMediaOBject.addListener(this.mediaQueryFunc1);
    this.mediaQueryFunc1(this.matchMediaOBject);

  }


  elemArr:Array<TemplateItem>=[];  //holds unformatted data
  count=0;
  id=0;

  title=new FormControl('', Validators.required); //template title
  type:string;  //template type eg. custom 
  typeData:any;  //template type object
  templateID:string;  //template id
  template:Template;
  create:'?'|'save'|'create'='?';  
  generatedTemplate=false;  //no template is yet generated
  isPublic:boolean;

  doing=false;
  msg='';
  
  options=null;
  

  shortenArrow='keyboard_arrow_left';

  shortenClick() {
   let right:HTMLElement=document.querySelector('.right');
   if(right.style.gridColumn=='2 / span 1') {
     
    let t:HTMLElement=document.querySelector('app-design');
    t.style.width='auto';
    right.style.gridColumn='';
    right.style.width= right.style.height='100%';
    right.style.position='absolute';
    this.shortenArrow='keyboard_arrow_right';
   }
   else {
    
    right.style.position='static';
    right.style.gridColumn=' 2/span 1';
    this.shortenArrow='keyboard_arrow_left';
    this.mediaQueryFunc1(this.matchMediaOBject);
   }
  }


  ngOnInit() {
    //eg: custom-templateID
    let param=this.route.paramMap.pipe(takeWhileAlive(this)).subscribe((paramMap)=>{
      let param=paramMap.get('id').split('-');
      this.type=param[0];

      this.template=null;
      this.isPublic=true;
      this.title.setValue(''); 
      this.create='create';
      this.generatedTemplate=false;

      this.db.collection('templateTypes', ref=>ref.where('id','==', param[0]))
          .valueChanges().pipe(take(1)).subscribe((data:any)=>{
  
        if(data.length) {
  
          this.typeData=data[0];
          this.options=data[0].options;  
          this.create='create';
          this.templateID=(new Date()).getTime().toString()+this.auth.user.id.slice(0,4);  

          if(this.elemArr) {
            let element = document.querySelector("#left");
            if(element)
              while (element.firstChild)
                element.removeChild(element.firstChild);
            element=document.querySelector("#page");
            if(element) {
              while (element.firstChild)
              element.removeChild(element.firstChild);
            }
            this.elemArr=[];
          }
          
          if(param.length>1) {  //if 2nd array item is there
            this.templateID=param[1];
            this.create='save';
            this.generatedTemplate=true;
  
            this.db.collection("templates").doc(param[1])
            .valueChanges().pipe(take(1)).subscribe((template:Template)=> {          
              if(template) {
                this.template=template;
                this.isPublic=template.isPublic;
                this.title.setValue(template.title);
                this.render(this.template);         
              }
              else console.log('error retrieving template');
            });
          }
 
        }
        else {
          console.log("error with template type");
        }
      });
    });
    
  }

  render(data:Template) {
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
    
    if(!right) {  //create page element if not present 
        right = document.querySelector('#right');
        let temp=document.createElement('div');
        temp.className=this.typeData.css;
        temp.id='page';
        temp.style.overflow='auto';
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
      id:id,
      type:type,
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
		  if(t[i].type=='img'||t[i].type=='cover-img')
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
      let file=data.element2.files[0];
      if(file) {
        let reader=encodeImageToUrl.bind(this)(file);
        if(reader) 
          reader.onloadend=()=>{
            data.element.src=<string>reader.result;
          };
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

    let obsList=[];
    let imgPercent=0;
    
    if(this.elemArr.length) {

      console.log(this.elemArr)
      this.doing=true;
      for(let i of this.elemArr) {
        let data=i;
        if(data.type=='img'||data.type=='cover-img') {
          if(data.file) {
            let obs=new Observable((obs)=>{
              let filePath =`templates/${this.templateID}/${data.time}`; 
              let fileRef=this.storage.ref(filePath);  
              const task = this.storage.upload(filePath, data.file);
              task.snapshotChanges().pipe(finalize(()=>{
                let g=fileRef.getDownloadURL().pipe(take(1)).subscribe((url)=>{
                  imgPercent+=100/obsList.length;
                  this.msg='Doing Job..(Images: '+imgPercent+'%)';
                  obs.next(url);             
                  obs.complete();
                });
              }),take(1)).subscribe();
      
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
            if(h) value=h; else value=(<HTMLImageElement>data.element).src;
          }
          else if(data.type=='link-img') value=(<HTMLImageElement>data.element).src;
          else value=data.element.textContent;
          saveArr.push({type:data.type,data:value,time:data.time});
        }

        this.db.collection("templates").doc<Template>(this.templateID).set({
          id:this.templateID,
          datas:saveArr,
          type:this.typeData.id,
          userName:this.auth.user.name,
          userID:this.auth.user.id,
          title:this.title.value,
          isPublic:this.isPublic,
          css:this.typeData.css,
          date:new Date()  //last updated
        })
        .then(()=> {
          if(this.template) {
            this.doing=false;
            this.generatedTemplate=true;
            this.template.title=this.title.value;
            return;           
          }
          this.msg="Doing Job..(save user info)";
          this.db.collection("users").doc(this.auth.user.id).collection("others")
          .doc("templates").update({
            datas: firebase.firestore.FieldValue.arrayUnion(this.templateID),
          })
          .then(()=> {
            this.doing=false;
            this.generatedTemplate=true;
            this.router.navigate([`../${this.type}-${this.templateID}`], { relativeTo: this.route });
          })
          .catch((error)=> {
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
        let filePath =`templates/${this.templateID}/${data.time}`;
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

          this.db.collection("templates").doc(this.templateID).delete()
          .then(()=> {
              this.msg="Deleting...(user info)";
              this.db.collection("users").doc(this.auth.user.id)
               .collection("others").doc("templates").update({
                datas: firebase.firestore.FieldValue.arrayRemove(this.templateID)
              })
              .then(()=> {
                this.doing=false;
                this.router.navigate(['../custom'], { relativeTo: this.route });
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

  ngOnDestroy(): void {
    if(this.matchMediaOBject && this.mediaQueryFunc1)
      this.matchMediaOBject.removeListener(this.mediaQueryFunc1);
  }

}
