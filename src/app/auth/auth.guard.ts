import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot,CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { SignInCheckService} from '../sign-in-check.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild  {
  status=false;
  constructor(private auth:SignInCheckService){
    this.auth.status.subscribe({
   		next:(user:{uid:string})=>{
      		this.status=user?true:false;
    	}
   	});
  }		
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    	return this.status;
    }
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    	return this.status;
  	}	
}
