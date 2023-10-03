import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { setTime } from 'src/app/store/app.actions';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectTime,
  selectTimeFrom,
  selectTimeTo,
} from 'src/app/store/app.selectors';

@Component({
  selector: 'app-player-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  @ViewChild('dot') dot: ElementRef<HTMLDivElement>;
  @ViewChild('line') line: ElementRef<HTMLDivElement>;

  public current?: Date;
  public from?: Date;
  public to?: Date;
  constructor(private store: Store<RootState>, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.store.pipe(select(selectTime)).subscribe((date) => {
      this.current = date;
      this.cd.detectChanges()
    });
    this.store.pipe(select(selectTimeFrom)).subscribe((time) => {
      if (time) {
        this.from = time;
        this.dot.nativeElement.style.left = `0px`;
      }
    });

    this.store.pipe(select(selectTimeTo)).subscribe((time) => {
      if (time) {
        this.to = time;
      }
    });
  }

  public changeTimeline(event: MouseEvent) {
    if (!this.from || !this.to) {
      return;
    }

    this.dot.nativeElement.style.left = `${event.offsetX}px`;
    const percentage = event.offsetX / this.line.nativeElement.clientWidth;
    const time = (this.to.getTime() - this.from.getTime()) * percentage;
    this.store.dispatch(
      setTime({ time: new Date(this.from.getTime() + time) })
    );
  }
}
