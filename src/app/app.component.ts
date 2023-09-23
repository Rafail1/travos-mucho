import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { RootState } from './store/app.reducer';
import { Observable, map, tap } from 'rxjs';
import { selectAllSymbols, selectSymbol } from './store/app.selectors';
import { init, setSymbol } from './store/app.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public symbol$: Observable<string | undefined>;
  public options$: Observable<Array<string> | undefined>;
  constructor(private store: Store<RootState>) {}
  ngOnInit(): void {
    this.symbol$ = this.store.pipe(select(selectSymbol));
    this.options$ = this.store.pipe(
      select(selectAllSymbols),
      map((symbols) => symbols || [])
    );
    this.init();
  }

  public symbolChanged(symbol: any) {
    this.store.dispatch(setSymbol({ symbol: symbol.target.value }));
  }

  private init() {
    this.store.dispatch(init());
  }
}
