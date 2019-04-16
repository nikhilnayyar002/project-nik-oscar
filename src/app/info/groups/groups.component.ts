
import { Component, OnInit } from '@angular/core';
import { Subject} from 'rxjs';
import { debounceTime, map,distinctUntilChanged, switchMap} from 'rxjs/operators';
import { PoolService } from 'src/app/pool.service';
import { Group } from 'src/app/model/group';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  groups$;
  private searchTerms = new Subject<string>();
 
  constructor(private ps:PoolService) {}
 
  search(term: string): void {
    this.searchTerms.next(term);
  }
 
  ngOnInit(): void {
    this.groups$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.searchGroups(term)),
    );
    setTimeout(()=>this.searchTerms.next(""),200);  
  }

  searchGroups(term: string) {
    let groupsFilter=(groups:Array<Group>)=> { 
  	  return groups.filter((group) =>group.title.includes(term))
    };
    //if (!term.trim()) { return of([]);}
    return this.ps.groups$.pipe(map(groupsFilter));
  }

}