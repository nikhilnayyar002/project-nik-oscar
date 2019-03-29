import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { global } from 'src/app/shared/global';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {

  constructor(
    private db:AngularFirestore,
    private router:Router
    ) { }

  templates$;

  ngOnInit() {
  	this.templates$=this.db.collection('templateTypes').valueChanges();
  }

  navigate(id) {
  	this.router.navigate([global.templateDesignLink+id]);
  }

}
