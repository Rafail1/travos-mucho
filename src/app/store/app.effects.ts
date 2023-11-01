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
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { MarketDataService } from '../common/market-data/market-data.service';
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
import { selectSymbol, selectTime } from './app.selectors';
import { filterNullish } from '../common/utils/filter-nullish';
import { DateService } from '../common/utils/date.service';

@Injectable()
export class AppEffects {
  setTime$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setTime),
      filterNullish(),
      map(({ time }) => this.dateService.filterTime(time)),
      distinctUntilChanged((prev, crt) => prev.getTime() === crt.getTime()),
      withLatestFrom(
        this.store
          .select(selectSymbol)
          .pipe(filter((symbol) => symbol !== undefined)) as Observable<string>
      ),
      switchMap(([time, symbol]) => {
        return [
          getAggTrades({ symbol, time }),
          getDepth({ symbol, time }),
          getCluster({ symbol, time }),
        ];
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
      switchMap(() => {
        return [cleanCandlestickData(), cleanBarYs()];
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

  getCluster$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getCluster),
      switchMap((action) =>
        this.loaderService.loadCluster(action).pipe(
          map((payload) =>
            getClusterSuccess({
              cluster: payload,
              symbol: action.symbol,
            })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(init),
      exhaustMap(() =>
        this.marketDataService.getSymbols().pipe(
          map((symbols: Array<{ symbol: string; tickSize: string }>) =>
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
      switchMap(({ symbols }) => of(setSymbol({ symbol: symbols[0].symbol })))
    )
  );

  setTimeFrom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setTimeFrom),
      switchMap(({ time }) => of(setTime({ time: new Date(time.getTime()) })))
    )
  );

  forward$ = createEffect(() =>
    this.actions$.pipe(
      ofType(forward),
      withLatestFrom(this.store.pipe(select(selectTime))),
      switchMap(([{ step }, time]) => {
        if (!time) {
          return EMPTY;
        }
        return of(setTime({ time: new Date(time.getTime() + step) }));
      })
    )
  );

  rewind$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rewind),
      withLatestFrom(this.store.pipe(select(selectTime))),
      switchMap(([{ step }, time]) => {
        if (!time) {
          return EMPTY;
        }
        return of(setTime({ time: new Date(time.getTime() + step) }));
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
