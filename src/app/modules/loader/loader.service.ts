import { Injectable } from '@angular/core';
import { Observable, map, of, tap, withLatestFrom } from 'rxjs';
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
import { RootState } from 'src/app/store/app.reducer';
import { Store, select } from '@ngrx/store';
import { selectTickSize } from 'src/app/store/app.selectors';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
@Injectable()
export class LoaderService {
  private currentSymbol: string;
  private depthCache = new Map<
    string,
    Map<string, { depth: Array<IBar>; snapshot: ISnapshotFormatted }>
  >();
  private clusterCache = new Map<string, Map<string, Array<ICluster>>>();
  private aggTradesCache = new Map<string, Map<string, Array<IAggTrade>>>();
  constructor(
    private backendService: BackendService,
    private barService: BarService,
    private store: Store<RootState>
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
  }): Observable<{ depth: Array<IBar>; snapshot: ISnapshotFormatted }> {
    if (this.currentSymbol !== symbol) {
      this.depthCache.delete(this.currentSymbol);
      this.aggTradesCache.delete(this.currentSymbol);
      this.currentSymbol = symbol;
    }

    const key = `${time.getTime()}`;
    if (this.depthCache.get(symbol)?.has(key)) {
      const data = this.depthCache.get(symbol)?.get(key);
      if (data !== undefined) {
        return of(data);
      }
    }

    return this.backendService.getDepth(symbol, time).pipe(
      withLatestFrom(this.store.pipe(select(selectTickSize), filterNullish())),
      map(([data, tickSize]) => {
        const formattedSnapshot = [
          ...data.snapshot.asks.map((item) => ({
            E: data.snapshot.E,
            depth: item,
            type: 'ask' as IBarType,
            ...this.barService.calculateOptions({
              type: 'ask',
              price: Number(item[0]),
              value: Number(item[1]),
            }),
          })),
          ...data.snapshot.bids.map((item) => ({
            E: data.snapshot.E,
            depth: item,
            type: 'bid' as IBarType,
            ...this.barService.calculateOptions({
              type: 'bid',
              price: Number(item[0]),
              value: Number(item[1]),
            }),
          })),
        ].reduce((acc, item) => {
          acc[Number(item.depth[0])] = item;
          return acc;
        }, {} as { [key: number]: IBar });

        const formattedDepth = [];
        for (let index = 0; index < data.depth.length; index++) {
          for (const item of data.depth[index].a) {
            formattedDepth.push({
              E: data.depth[index].E,
              depth: item,
              type: 'ask' as IBarType,
              ...this.barService.calculateOptions({
                type: 'ask',
                price: Number(item[0]),
                value: Number(item[1]),
              }),
            });
          }
          for (const item of data.depth[index].b) {
            formattedDepth.push({
              E: data.depth[index].E,
              depth: item,
              type: 'bid' as IBarType,
              ...this.barService.calculateOptions({
                type: 'bid',
                price: Number(item[0]),
                value: Number(item[1]),
              }),
            });
          }
        }

        const middleAsk = Number(
          data.snapshot.asks[data.snapshot.asks.length - 1][0]
        );
        const middleBid = Number(data.snapshot.bids[0][0]);
        const max = middleAsk + Number(tickSize) * data.snapshot.asks.length;
        const min = middleBid - Number(tickSize) * data.snapshot.bids.length;

        const result = {
          depth: formattedDepth,
          snapshot: { E: data.snapshot.E, data: formattedSnapshot, max, min },
        };
        this.depthCache.get(symbol)?.set(key, result);

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
