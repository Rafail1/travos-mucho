import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { EMPTY, Observable, map, of, tap, withLatestFrom } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectClusters,
  selectPricePrecision,
  selectTickSize,
} from 'src/app/store/app.selectors';
import {
  BackendService,
  IAggTrade,
  IBar,
  ICluster,
  IDepth,
  ISnapshot,
  ISnapshotFormatted,
} from '../backend/backend.service';
import { IBarType } from '../scalp/calculation/bar/bar.interface';
import { BarService } from '../scalp/calculation/bar/bar.service';
import { CalculationService } from './calculation.service';
@Injectable()
export class LoaderService {
  private currentSymbol: string;
  private depthCache = new Map<
    string,
    Map<string, { depth: IDepth[]; snapshot: ISnapshot }>
  >();
  private clusterCache = new Map<string, Map<string, Array<ICluster>>>();
  private aggTradesCache = new Map<string, Map<string, Array<IAggTrade>>>();
  constructor(
    private backendService: BackendService,
    private barService: BarService,
    private store: Store<RootState>,
    private calculationService: CalculationService
  ) {}

  loadAggTrades({ symbol, time }: { symbol: string; time: Date }) {
    if (this.currentSymbol !== symbol) {
      this.depthCache.delete(this.currentSymbol);
      this.aggTradesCache.delete(this.currentSymbol);
      this.currentSymbol = symbol;
    }
    const key = `${time.getTime()}`;
    if (this.aggTradesCache.get(symbol)?.has(key)) {
      return of(this.aggTradesCache.get(symbol)?.get(key));
    }
    return this.backendService.getAggTrades(symbol, time).pipe(
      tap((data) => {
        this.aggTradesCache.get(symbol)?.set(key, data);
      })
    );
  }

  loadDepth({
    symbol,
    time,
  }: {
    symbol: string;
    time: Date;
  }): Observable<
    { depth: Array<IBar>; snapshot: ISnapshotFormatted } | undefined
  > {
    if (this.currentSymbol !== symbol) {
      this.depthCache.delete(this.currentSymbol);
      this.aggTradesCache.delete(this.currentSymbol);
      this.currentSymbol = symbol;
    }

    const key = `${time.getTime()}`;
    let data$;
    if (this.depthCache.get(symbol)?.has(key)) {
      const data = this.depthCache.get(symbol)?.get(key);
      data$ = of(data);
    } else {
      data$ = this.backendService.getDepth(symbol, time);
    }

    return data$.pipe(
      filterNullish(),
      withLatestFrom(
        this.store.pipe(select(selectTickSize), filterNullish()),
        this.store.pipe(select(selectPricePrecision), filterNullish())
      ),
      map(([data, tickSize, pricePrecision]) => {
        if (!data.snapshot) {
          return;
        }
        this.depthCache.get(symbol)?.set(key, data);

        const formattedSnapshot = this.calculationService.getFormattedSnapshot(
          data.snapshot
        );

        const formattedDepth = this.calculationService.getFormattedDepth(
          data.depth
        );

        const middleAsk = Number(data.snapshot.asks[0][0]);
        const middleBid = Number(data.snapshot.bids[0][0]);
        const max = Number(
          (
            middleAsk +
            Number(
              (Number(tickSize) * data.snapshot.asks.length).toFixed(
                pricePrecision
              )
            )
          ).toFixed(Number(pricePrecision))
        );
        const min = Number(
          (
            middleBid -
            Number(
              (Number(tickSize) * data.snapshot.bids.length).toFixed(
                pricePrecision
              )
            )
          ).toFixed(Number(pricePrecision))
        );

        const result = {
          depth: formattedDepth,
          snapshot: { E: data.snapshot.E, data: formattedSnapshot, max, min },
        };

        return result;
      })
    );
  }

  loadCluster({ symbol, time }: { symbol: string; time: Date }) {
    if (this.currentSymbol !== symbol) {
      this.depthCache.delete(this.currentSymbol);
      this.aggTradesCache.delete(this.currentSymbol);
      this.clusterCache.delete(this.currentSymbol);
      this.currentSymbol = symbol;
    }

    const key = `${time.getTime()}`;
    if (this.clusterCache.get(symbol)?.has(key)) {
      const data = this.clusterCache.get(symbol)?.get(key);
      if (data !== undefined) {
        return of(data);
      }
    }

    return this.backendService
      .getCluster(symbol, time)
      .pipe(tap((data) => this.clusterCache.get(symbol)?.set(key, data)));
  }
}
