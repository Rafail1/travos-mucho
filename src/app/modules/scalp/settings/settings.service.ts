import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { RootState } from 'src/app/store/app.reducer';
import { selectSymbol } from 'src/app/store/app.selectors';
import { setConfig } from 'src/app/store/config/config.actions';
import { ConfigState, initialState } from 'src/app/store/config/config.reducer';
import { selectConfig } from 'src/app/store/config/config.selectors';

@Injectable()
export class SettingsService {
  private symbol: string;
  private _setConfig = new Subject<void>();
  public setConfig$: Observable<void>;
  constructor(private store: Store<RootState>) {
    this.setConfig$ = this._setConfig.asObservable();
    this.store
      .select(selectSymbol)
      .pipe(filterNullish())
      .subscribe((symbol) => {
        this.symbol = symbol;
      });
  }

  public getSettings(symbol?: string): ConfigState {
    try {
      const storedItem = localStorage.getItem(
        `config:${symbol || this.symbol}`
      );
      if (storedItem) {
        return JSON.parse(storedItem);
      } else {
        return initialState;
      }
    } catch (e) {
      return initialState;
    }
  }

  public getStyle() {
    return {
      glass: {
        width: 300,
        height: 700,
        x: 0,
        y: 0,
      },
      tick: {
        width: 300,
        height: 700,
        x: 300,
        y: 0,
      },
      cluster: {
        backgroundColor: '#ffff00',
      },
      thresholds: {
        big: {
          fillAskColor: '#ffff00',
          fillBidColor: '#ff00ff',
          textColor: '#ffffff',
          backgroundColor: { ask: 'lightgreen', bid: '#FF7276' },
        },
        huge: {
          fillAskColor: '#00ffff',
          fillBidColor: '#0000ff',
          textColor: '#00ffff',
          backgroundColor: { ask: 'lightgreen', bid: '#FF7276' },
        },
      },
      barHeight: 16,
      clusterWidth: 60,
      fillCombinedColor: 'red',
      fillAskSpreadColor: '#987654',
      fillBidSpreadColor: '#456789',
      fillAskColor: 'green',
      fillBidColor: 'red',
      textColor: 'white',
      backgroundColor: { ask: 'lightgreen', bid: '#FF7276' },
      tickBuyColor: 'green',
      tickSellColor: 'red',
    } as any;
  }

  public setSettings(config: ConfigState) {
    localStorage.setItem(`config:${this.symbol}`, JSON.stringify(config));
    this.store.dispatch(setConfig({ config }));
    this._setConfig.next();
  }
}
