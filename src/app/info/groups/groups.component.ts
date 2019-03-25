
import { Component, OnInit } from '@angular/core';
import { Observable, Subject ,of} from 'rxjs';
import { debounceTime, map,distinctUntilChanged, switchMap} from 'rxjs/operators';
import { PostService} from '../../post.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  groups$;
  private searchTerms = new Subject<string>();
 
  constructor(private ps:PostService) {}
 
  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }
 
  ngOnInit(): void {
    this.groups$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
 
      // ignore new term if same as previous term
      distinctUntilChanged(),
 
      // switch to new search observable each time the term changes
      switchMap((term: string) => this.searchGroups(term)),
    );
    setTimeout(()=>this.searchTerms.next(""),200);  
  }


 searchGroups(term: string) {
  let groupsFilter=(groups:Array<{name:string;}>)=> { 
  	return groups.filter((group:{name:string;}) =>group.name.includes(term))
  };
  //if (!term.trim()) { return of([]);}
  return this.ps.chats$.pipe(map(groupsFilter));
 }

}