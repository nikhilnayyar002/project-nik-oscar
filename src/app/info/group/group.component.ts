import { Component} from '@angular/core';
import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
import { ActivatedRoute , ParamMap, Router} from '@angular/router';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
@AutoUnsubscribe()//.pipe(takeWhileAlive(this)) import { AutoUnsubscribe, takeWhileAlive } from 'take-while-alive';
export class GroupComponent {
 
  option:'general'|'?'|'discussions'|'users'='?';

  ngOnInit() {
    this.route.paramMap.pipe(takeWhileAlive(this)).subscribe((params: ParamMap) => {
      let id=params.get('id');
      if(this.router.url==`/info/groups/${id}`)
        this.option='general';
    });
  }

  constructor(private router: Router,private route: ActivatedRoute) {

  }

}








