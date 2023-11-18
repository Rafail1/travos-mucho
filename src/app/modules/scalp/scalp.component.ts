import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, debounceTime, of } from 'rxjs';
import { setScroll } from 'src/app/store/app.actions';
import { RootState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-scalp',
  template: '<app-d4-renderer (scroll)="onScroll($event)"></app-d4-renderer>',
})
export class ScalpComponent implements OnInit {
  private scrollSubject = new Subject();
  constructor(private store: Store<RootState>) {}
  ngOnInit(): void {
    this.scrollSubject.pipe(debounceTime(10)).subscribe((event: any) => {
      this.store.dispatch(setScroll({ scroll: event.target.scrollTop }));
    });
  }
  onScroll(event: any) {
    this.scrollSubject.next(event);
  }
}
