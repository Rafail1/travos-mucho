import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { MarketDataService } from '../common/market-data/market-data.service';
import { BackendService } from '../modules/backend/backend.service';
import {
  cleanCandlestickData,
  getAggTrades,
  getAggTradesSuccess,
  getCandlestickDataSuccess,
  getDepth,
  getDepthSuccess,
  getSymbolsSuccess,
  init,
  setSymbol,
  setTime,
} from './app.actions';
import { RootState } from './app.reducer';
import { selectSymbol } from './app.selectors';
import { LoaderService } from '../modules/loader/loader.service';

@Injectable()
export class AppEffects {
  setTime$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setTime),
      withLatestFrom(
        this.store
          .select(selectSymbol)
          .pipe(filter((symbol) => symbol !== undefined)) as Observable<string>
      ),
      switchMap(([action, symbol]) => {
        return [
          getAggTrades({ symbol, time: action.time }),
          getDepth({ symbol, time: action.time }),
        ];
      })
    )
  );

  setSymbol$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSymbol),
      switchMap((action) => {
        const date = new Date();
        date.setDate(date.getDate() - 2);
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
        return [cleanCandlestickData()];
      })
    )
  );

  getAggTrades$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getAggTrades),
      switchMap((action) =>
        this.loaderService.loadAggTrades(action).pipe(
          map((data: any) => getAggTradesSuccess({ trades: data })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getDepth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getDepth),
      exhaustMap((action) =>
        this.loaderService.loadDepth(action).pipe(
          map((payload: any) => getDepthSuccess({ depth: payload })),
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
          map((symbols: Array<string>) => getSymbolsSuccess({ symbols })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getSymbolsSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getSymbolsSuccess),
      switchMap(({ symbols }) => of(setSymbol({ symbol: symbols[0] })))
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private loaderService: LoaderService,
    private marketDataService: MarketDataService
  ) {}
}
