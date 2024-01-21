import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store, select } from '@ngrx/store';
import { EMPTY, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
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
  recalculateAndRedraw,
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
import { setConfig, setSquiz } from './config/config.actions';
import { SettingsService } from '../modules/scalp/settings/settings.service';

@Injectable()
export class AppEffects {
  setTime$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setTime),
      filterNullish(),
      map(({ time }) => this.dateService.filterTime(time)),
      distinctUntilChanged((prev, crt) => prev.getTime() === crt.getTime()),
      withLatestFrom(this.store.pipe(select(selectSymbol), filterNullish())),
      switchMap(([time, symbol]) => {
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
        return [cleanCandlestickData(), cleanBarYs()];
      })
    )
  );

  setConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setConfig),
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

  recalculateAndRedraw$ = createEffect(() =>
    this.actions$.pipe(
      ofType(recalculateAndRedraw),
      debounceTime(500),
      withLatestFrom(
        this.store.pipe(
          select(selectTime),
          filterNullish(),
          map((time) => this.dateService.filterTime(time))
        ),
        this.store.pipe(select(selectSymbol), filterNullish())
      ),
      switchMap(([, time, symbol]) => {
        const times = [];
        const actions: Array<Action> = [
          getAggTrades({ symbol, time }),
          getDepth({ symbol, time }),
        ];

        for (let i = 0; i < 5; i++) {
          if (i === 0) {
            time = this.dateService.filterTime(time, FIVE_MINUTES);
          }
          times.push(time);
          time = this.dateService.prevFilterTime(time, FIVE_MINUTES);
        }

        if (times.length) {
          times.forEach((item) => {
            actions.push(getCluster({ time: item, symbol }));
          });
        }

        return actions;
      })
    )
  );

  getClusterTimes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setTime),
      map(({ time }) => this.dateService.filterTime(time, FIVE_MINUTES)),
      distinctUntilChanged((prev, crt) => prev.getTime() === crt.getTime()),
      withLatestFrom(this.store.pipe(select(selectSymbol), filterNullish())),
      switchMap(([time, symbol]) => {
        const times = [];
        for (let i = 0; i < 5; i++) {
          times.push(time);
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

  // getCluster$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(getCluster),
  //     mergeMap((action) => {
  //       return this.loaderService.loadCluster(action).pipe(
  //         map((payload) =>
  //           getClusterSuccess({
  //             time: action.time,
  //             cluster: payload,
  //             symbol: action.symbol,
  //           })
  //         ),
  //         catchError((e) => {
  //           console.error(e);
  //           return EMPTY
  //         })
  //       );
  //     })
  //   )
  // );

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

  forward$ = createEffect(() =>
    this.actions$.pipe(
      ofType(forward),
      withLatestFrom(this.store.pipe(select(selectTime))),
      switchMap(([{ step, redraw }, time]) => {
        if (!time) {
          return EMPTY;
        }

        const actions: Array<Action> = [
          setTime({
            time: new Date(time.getTime() + step),
          }),
        ];

        if (redraw) {
          actions.push(recalculateAndRedraw());
        }

        return actions;
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
        const actions: Array<Action> = [
          setTime({
            time: new Date(time.getTime() - step),
          }),
        ];

        if (redraw) {
          actions.push(recalculateAndRedraw());
        }

        return actions;
      })
    )
  );

  constructor(
    private actions$: Actions,
    private dateService: DateService,
    private store: Store<RootState>,
    private loaderService: LoaderService,
    private marketDataService: MarketDataService
  ) {}
}
