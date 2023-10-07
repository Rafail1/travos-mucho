import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, filter, map, tap } from 'rxjs';
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
export class TimelineComponent implements OnInit, AfterViewInit {
  @ViewChild('dot') dot: ElementRef<HTMLDivElement>;
  @ViewChild('line') line: ElementRef<HTMLDivElement>;

  public current?: Date;
  public from?: Date;
  public to?: Date;
  private selectTime$: Observable<Date | undefined>;
  private selectTimeFrom$: Observable<Date | undefined>;
  private selectTimeTo$: Observable<Date | undefined>;
  constructor(private store: Store<RootState>, private cd: ChangeDetectorRef) {
    this.selectTime$ = this.store.pipe(select(selectTime));
    this.selectTimeFrom$ = this.store.pipe(select(selectTimeFrom));
    this.selectTimeTo$ = this.store.pipe(select(selectTimeTo));
  }

  ngOnInit(): void {
    this.selectTime$.subscribe((date) => {
      this.current = date;
      this.cd.detectChanges();
    });

    this.selectTimeFrom$.subscribe((time) => {
      if (time) {
        this.from = time;
        this.dot.nativeElement.style.left = `0px`;
      }
    });

    this.selectTimeTo$.subscribe((time) => {
      if (time) {
        this.to = time;
      }
    });
  }
  ngAfterViewInit() {
    combineLatest([this.selectTime$, this.selectTimeFrom$, this.selectTimeTo$])
      .pipe(
        map(([time, timeFrom, timeTo]) => {
          if (time && timeFrom && timeTo) {
            const fullLength = timeTo.getTime() - timeFrom.getTime();
            const offsetTime = time.getTime() - timeFrom.getTime();
            const percentage = offsetTime / fullLength;
            const calculatedPosition =
              this.line.nativeElement.clientWidth * percentage;
            let offsetX = Math.max(calculatedPosition, 0);
            offsetX = Math.min(offsetX, this.line.nativeElement.clientWidth);
            this.dot.nativeElement.style.left = `${offsetX}px`;
          }
        })
      )
      .subscribe();
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
