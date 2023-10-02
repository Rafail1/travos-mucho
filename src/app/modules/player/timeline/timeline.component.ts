import {
  Component,
  Input,
  OnInit,
  Query,
  ViewChild,
  QueryList,
  ElementRef,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'app-player-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  @ViewChild('dot') dot: ElementRef<HTMLDivElement>;
  @Input() from: Date;
  @Input() to: Date;
  current$ = new BehaviorSubject<Date | null>(null);

  public changeTimeline(event: MouseEvent) {
    this.dot.nativeElement.style.left = `${event.offsetX}px`;
    const percentage =
      (event.offsetX / this.dot.nativeElement.clientWidth) * 100;
    const time = ((this.to.getTime() - this.from.getTime()) / 100) * percentage;
    this.current$.next(new Date(this.from.getTime() + time));
  }

  ngOnInit(): void {
    this.current$.next(new Date(this.from.getTime()));
  }
}
