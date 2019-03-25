import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { Router}   from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(private db:AngularFirestore, private router:Router) { }
  templates$;

  ngOnInit() {
  	this.templates$=this.db.collection('templates').valueChanges();
  }

  navigate(id) {
  	this.router.navigate(['/template/design/'+id]);
  }

}
