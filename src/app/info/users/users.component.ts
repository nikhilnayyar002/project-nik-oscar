import { Component, OnInit } from '@angular/core';
import { Observable, Subject ,of} from 'rxjs';
import { debounceTime, map,distinctUntilChanged, switchMap} from 'rxjs/operators';
import { PostService} from '../../post.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users$;
  private searchTerms = new Subject<string>();
 
  constructor(private ps:PostService) {}
 
  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }
 
  ngOnInit(): void {
    this.users$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
 
      // ignore new term if same as previous term
      distinctUntilChanged(),
 
      // switch to new search observable each time the term changes
      switchMap((term: string) => this.searchUsers(term)),
    );
    setTimeout(()=>this.searchTerms.next(""),200);  
  }


 searchUsers(term: string) {
  let userFilter=(users:Array<{name:string;}>)=> { 
    return users.filter((user:{name:string;}) =>user.name.includes(term))
  };
  //if (!term.trim()) { return of([]);}
  return this.ps.users$.pipe(map(userFilter));
 }

}