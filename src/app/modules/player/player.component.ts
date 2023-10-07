import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, filter, interval, map, takeUntil } from 'rxjs';
import { forward, pause } from 'src/app/store/app.actions';
import { RootState } from 'src/app/store/app.reducer';
import { selectPlaying } from 'src/app/store/app.selectors';
export const FIVE_MINUTES = 1000 * 60 * 5;
export const STEP = 100;
export const REWIND_SECONDS = 1000 * 30;
export const FORWARD_SECONDS = 1000 * 30;
@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit {
  private playing$: Observable<boolean>;
  constructor(private store: Store<RootState>) {
    this.playing$ = this.store.pipe(select(selectPlaying));
  }
  ngOnInit(): void {
    this.store.pipe(
      select(selectPlaying),
      map((playing) => {
        if (playing) {
          this.play();
        } else {
          this.store.dispatch(pause());
        }
      })
    ).subscribe();
  }

  play() {
    interval(STEP)
      .pipe(takeUntil(this.playing$.pipe(filter((playing) => !playing))))
      .subscribe(() => {
        this.store.dispatch(forward({ step: STEP }));
      });
  }
}
