import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { PoolService } from 'src/app/pool.service';
import { Upload } from 'src/app/model/upload';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-upload-view',
  templateUrl: './upload-view.component.html',
  styleUrls: ['./upload-view.component.css']
})
export class UploadViewComponent implements OnInit {

  trackById(index: number, upload): string {return upload.id; }

  uploads$;

  constructor(
    public ps:PoolService
    ) { 
     
  }

  ngOnInit() {
   let func=(datas:Array<Upload>)=> datas.filter(data=> data.isPublic);
   this.uploads$= this.ps.uploads$.pipe(map(func));
  }

  ngOnDestroy() {
  
  }

}
