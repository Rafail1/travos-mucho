import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { EMPTY, Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  IExchangeInfo,
  MarketDataService,
} from '../common/market-data/market-data.service';
import { LoaderService } from '../modules/loader/loader.service';
import {
  cleanBarYs,
  cleanCandlestickData,
  forward,
  getAggTrades,
  getAggTradesSuccess,
  getCandlestickDataSuccess,
  getCluster,
  getClusterSuccess,
  getDepth,
  getDepthSuccess,
  getSymbolsSuccess,
  init,
  rewind,
  setSymbol,
  setTime,
  setTimeFrom,
} from './app.actions';
import { RootState } from './app.reducer';
import { selectClusters, selectSymbol, selectTime } from './app.selectors';
import { filterNullish } from '../common/utils/filter-nullish';
import { DateService } from '../common/utils/date.service';
import { FIVE_MINUTES } from '../modules/player/player.component';
import { fillSettings, setConfig, setSquiz } from './config/config.actions';
import { SettingsService } from '../modules/scalp/settings/settings.service';

@Injectable()
export class AppEffects {
  setTime$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setTime),
      filterNullish(),
      map(({ time, redraw }) => {
        return { time: this.dateService.filterTime(time), redraw };
      }),
      distinctUntilChanged(
        (prev, crt) =>
          crt.redraw === false && prev.time.getTime() === crt.time.getTime()
      ),
      withLatestFrom(
        this.store.pipe(
          select(selectSymbol),
          filter((symbol) => symbol !== undefined)
        ) as Observable<string>
      ),
      switchMap(([{ time }, symbol]) => {
        return [getAggTrades({ symbol, time }), getDepth({ symbol, time })];
      })
    )
  );

  setSquiz$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSquiz),
      withLatestFrom(
        this.store.pipe(select(selectSymbol), filterNullish()),
        this.store.pipe(
          select(selectTime),
          filterNullish(),
          map((time) => this.dateService.filterTime(time))
        )
      ),
      switchMap(([, symbol, time]) => {
        return [getAggTrades({ symbol, time }), getDepth({ symbol, time })];
      })
    )
  );

  setSymbol$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSymbol),
      switchMap((action) => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return this.marketDataService
          .getCandlestickData(action.symbol, date)
          .pipe(
            map((data) => {
              return getCandlestickDataSuccess({ data });
            })
          );
      })
    )
  );

  setSymbolHood$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSymbol),
      switchMap((action) => {
        return [cleanCandlestickData(), cleanBarYs(), fillSettings(action)];
      })
    )
  );

  fillSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fillSettings),
      switchMap((action) => {
        const config = this.settingsService.getSettings(action.symbol);
        return of(setConfig({ config }));
      })
    )
  );

  getAggTrades$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getAggTrades),
      switchMap((action) => {
        return this.loaderService.loadAggTrades(action).pipe(
          map((data: any) =>
            getAggTradesSuccess({
              trades: data,
            })
          ),
          catchError(() => EMPTY)
        );
      })
    )
  );

  getAggTradesNext$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(getAggTrades),
        switchMap((action) => {
          return this.loaderService.loadAggTrades({
            symbol: action.symbol,
            time: this.dateService.nextFilterTime(action.time),
          });
        })
      ),
    { dispatch: false }
  );

  getDepthNext = createEffect(
    () =>
      this.actions$.pipe(
        ofType(getDepth),
        switchMap((action) => {
          return this.loaderService.loadDepth({
            symbol: action.symbol,
            time: this.dateService.nextFilterTime(action.time),
          });
        })
      ),
    { dispatch: false }
  );

  getDepth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getDepth),
      switchMap((action) =>
        this.loaderService.loadDepth(action).pipe(
          map((payload) =>
            getDepthSuccess({
              depth: payload,
              time: action.time,
              symbol: action.symbol,
            })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getClusterTimes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setTime),
      map(({ time, redraw }) => {
        return { time: this.dateService.filterTime(time), redraw };
      }),
      distinctUntilChanged(
        (prev, crt) =>
          crt.redraw === false && prev.time.getTime() === crt.time.getTime()
      ),
      withLatestFrom(
        this.store.pipe(select(selectClusters)),
        this.store.pipe(select(selectSymbol), filterNullish())
      ),
      switchMap(([action, clusters, symbol]) => {
        let time = action.time;
        const redraw = action.redraw;
        const times = [];
        for (let i = 0; i < 5; i++) {
          if (redraw || !clusters.has(time)) {
            times.push(time);
          }
          time = this.dateService.prevFilterTime(time, FIVE_MINUTES);
        }
        if (times.length) {
          return times.map((item) => {
            return getCluster({ time: item, symbol });
          });
        } else {
          return EMPTY;
        }
      })
    )
  );

  getCluster$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getCluster),
      mergeMap((action) => {
        return this.loaderService.loadCluster(action).pipe(
          map((payload) =>
            getClusterSuccess({
              time: action.time,
              cluster: payload,
              symbol: action.symbol,
            })
          ),
          catchError(() => EMPTY)
        );
      })
    )
  );

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(init),
      exhaustMap(() =>
        this.marketDataService.getSymbols().pipe(
          map((symbols: Array<IExchangeInfo>) =>
            getSymbolsSuccess({ symbols })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getSymbolsSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getSymbolsSuccess),
      // switchMap(({ symbols }) => of(setSymbol({ symbol: symbols[0].symbol })))
      switchMap(({ symbols }) => of(setSymbol({ symbol: 'BTCUSDT' })))
    )
  );

  setTimeFrom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setTimeFrom),
      switchMap(({ time }) =>
        of(setTime({ time: new Date(time.getTime()), redraw: false }))
      )
    )
  );

  forward$ = createEffect(() =>
    this.actions$.pipe(
      ofType(forward),
      withLatestFrom(this.store.pipe(select(selectTime))),
      switchMap(([{ step, redraw }, time]) => {
        if (!time) {
          return EMPTY;
        }
        return of(
          setTime({
            time: new Date(time.getTime() + step),
            redraw: Boolean(redraw),
          })
        );
      })
    )
  );

  rewind$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rewind),
      withLatestFrom(this.store.pipe(select(selectTime))),
      switchMap(([{ step, redraw }, time]) => {
        if (!time) {
          return EMPTY;
        }
        return of(
          setTime({
            time: new Date(time.getTime() - step),
            redraw: Boolean(redraw),
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private dateService: DateService,
    private store: Store<RootState>,
    private loaderService: LoaderService,
    private marketDataService: MarketDataService,
    private settingsService: SettingsService
  ) {}
}
