import { Component, OnInit } from '@angular/core';
import { Template } from 'src/app/model/template';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit {


  constructor(
    private db:AngularFirestore
    ) { }

  templates$:Observable<Array<Template>>;

  ngOnInit() {
  	this.templates$=this.db.collection<Template>('templates').valueChanges();
  }

}
