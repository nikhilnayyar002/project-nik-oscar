import { Component, OnInit } from '@angular/core';
import { NotifService } from 'src/app/notif.service';


@Component({
  selector: 'app-notif-palet',
  templateUrl: './notif-palet.component.html',
  styleUrls: ['./notif-palet.component.css']
})
export class NotifPaletComponent implements OnInit {

  constructor(private ns:NotifService) {

  }
  ngOnInit() {

  }
  
  scroll(link) {
    let x = document.querySelector(`#${link}`);
    if (x) x.scrollIntoView();
  }

  ngOnDestroy() {
    this.ns.viewed();
  }
}
