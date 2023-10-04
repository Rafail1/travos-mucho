import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { rewind, play, forward, setTime } from 'src/app/store/app.actions';
import { RootState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-player-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.scss'],
})
export class ButtonsComponent {
  playing = false;
  constructor(private store: Store<RootState>) {}
  public rewind() {
    this.store.dispatch(rewind());
  }
  public play() {
    if (!this.playing) {
      this.playing = true;

      //use rx timer

      // this.playingTimeoutId = setInterval(() => {
      //   this.store.dispatch(setTime({ time: new Date() }));
      // }, 100);
    }
  }
  public pause() {
    if (this.playing) {
      this.playing = false;
    }
  }
  public forward() {
    this.store.dispatch(forward());
  }
}
