import { Component, OnInit } from '@angular/core';
import { Subject} from 'rxjs';
import { debounceTime, map,distinctUntilChanged, switchMap} from 'rxjs/operators';
import { PoolService } from 'src/app/pool.service';
import { User } from 'src/app/model/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users$;
  private searchTerms = new Subject<string>();
 
  constructor(private ps:PoolService) {}
 
  search(term: string): void {
    this.searchTerms.next(term);
  }
 
  ngOnInit(): void {
    this.users$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.searchUsers(term)),
    );
    setTimeout(()=>this.searchTerms.next(""),200);  
  }


 searchUsers(term: string) {
  let userFilter=(users:Array<User>)=> { 
    return users.filter((user) =>user.name.includes(term))
  };
  //if (!term.trim()) { return of([]);}
  return this.ps.users$.pipe(map(userFilter));
 }

}