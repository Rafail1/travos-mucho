import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { init, setSymbol } from './store/app.actions';
import { RootState } from './store/app.reducer';
import { selectAllSymbols, selectSymbol } from './store/app.selectors';
import { IExchangeInfo } from './common/market-data/market-data.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { setSquiz } from './store/config/config.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public symbol$: Observable<string | undefined>;
  public options$: Observable<Array<IExchangeInfo> | undefined>;
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
