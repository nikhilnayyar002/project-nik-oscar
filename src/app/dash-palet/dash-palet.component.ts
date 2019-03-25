import { Component, OnInit } from '@angular/core';
import { SignInCheckService} from '../sign-in-check.service';

@Component({
  selector: 'app-dash-palet',
  templateUrl: './dash-palet.component.html',
  styleUrls: ['./dash-palet.component.css']
})
export class DashPaletComponent implements OnInit {

  constructor(public auth:SignInCheckService) { }

  ngOnInit() {
  }

}
