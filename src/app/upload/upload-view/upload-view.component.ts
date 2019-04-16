import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { PoolService } from 'src/app/pool.service';
import { Upload } from 'src/app/model/upload';
import { map, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { takeWhileAlive, AutoUnsubscribe } from 'take-while-alive';
import { global } from 'src/app/shared/global';

@Component({
  selector: 'app-upload-view',
  templateUrl: './upload-view.component.html',
  styleUrls: ['./upload-view.component.scss']
})
@AutoUnsubscribe()
export class UploadViewComponent implements OnInit {

  trackById(index: number, upload): string {return upload.id; }

  @Input() inputPosts=null;
  uploads;
  anchorScrollInit:boolean=false;

  constructor(
    public ps:PoolService,
    private route:ActivatedRoute
    ) { 
     
  }

  ngOnInit() {
    if(this.inputPosts) return;
    let func=(datas:Array<Upload>)=> datas.filter(data=> data.isPublic);
    this.ps.uploads$.pipe(map(func),takeWhileAlive(this)).subscribe((datas)=>{
      this.uploads=datas;
      if(!this.anchorScrollInit) {
        this.anchorScrollInit=true;
        this.route.fragment.pipe(map(fragment => fragment ||''),takeWhileAlive(this))
        .subscribe((data)=>{
          setTimeout(()=>{
            if (data){ 
              let x=document.querySelector(`#${data}`);
              x.scrollIntoView(); 
              document.documentElement.scrollTop-= global.headerHeight;
            }
          },0);
        });
      }

    });   
  }

}
