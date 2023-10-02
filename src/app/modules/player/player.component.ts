import { Component } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {
  from: Date;
  to: Date;
  constructor() {
    this.from = new Date();
    this.to = new Date();
    this.to.setMinutes(this.to.getMinutes() + 5);
  }
}
