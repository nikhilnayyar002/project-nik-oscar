import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot,CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { SignInCheckService} from '../sign-in-check.service';
import { Router , UrlTree}   from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild  {
  constructor(private router:Router, private auth:SignInCheckService){
  }		
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): any{
      if(this.auth.init) {
        if(!this.auth.status) {
          const tree: UrlTree =this.router.parseUrl('/home');
          return tree;
        }
    	  return true;
      }
      else {
       return this.auth.status$; 
      }
    }
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return this.canActivate(route,state);
  	}	
}