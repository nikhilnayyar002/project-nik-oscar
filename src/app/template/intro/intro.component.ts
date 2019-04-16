import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { global } from 'src/app/shared/global';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent implements OnInit {

  constructor(
    private db:AngularFirestore
    ) { }

  templates$;

  ngOnInit() {
  	this.templates$=this.db.collection('templateTypes').valueChanges();
  }

}
