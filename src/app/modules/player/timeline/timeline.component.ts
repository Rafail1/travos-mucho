import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { changeCurrentTime } from 'src/app/store/app.actions';
import { RootState } from 'src/app/store/app.reducer';
import { selectCurrentTime } from 'src/app/store/app.selectors';

@Component({
  selector: 'app-player-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  @ViewChild('dot') dot: ElementRef<HTMLDivElement>;
  @Input() from: Date;
  @Input() to: Date;
  public current$: Observable<Date | undefined>;
  constructor(private store: Store<RootState>) {
    this.current$ = this.store.pipe(select(selectCurrentTime));
  }
  public changeTimeline(event: MouseEvent) {
    this.dot.nativeElement.style.left = `${event.offsetX}px`;
    const percentage =
      (event.offsetX / this.dot.nativeElement.clientWidth) * 100;
    const time = ((this.to.getTime() - this.from.getTime()) / 100) * percentage;
    this.store.dispatch(
      changeCurrentTime({ time: new Date(this.from.getTime() + time) })
    );
  }
}
