import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  rewind,
  play,
  forward,
  setTime,
  pause,
} from 'src/app/store/app.actions';
import { RootState } from 'src/app/store/app.reducer';
import { FORWARD_SECONDS, REWIND_SECONDS, STEP } from '../player.component';
import { Observable } from 'rxjs';
import { selectPlaying } from 'src/app/store/app.selectors';

@Component({
  selector: 'app-player-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.scss'],
})
export class ButtonsComponent {
  playing$: Observable<boolean>;
  constructor(private store: Store<RootState>) {
    this.playing$ = this.store.pipe(select(selectPlaying));
  }
  public rewind() {
    this.store.dispatch(rewind({ step: REWIND_SECONDS }));
  }
  public play() {
    this.store.dispatch(play());
  }
  public pause() {
    this.store.dispatch(pause());
  }
  public forward() {
    this.store.dispatch(forward({ step: FORWARD_SECONDS }));
  }
}
